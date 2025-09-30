"""
AWS Rekognition para reconocimiento facial
"""

import boto3
import base64
import json
from typing import Dict, Any, Optional, List
import logging
from django.conf import settings
import os

logger = logging.getLogger(__name__)


class AWSRekognitionService:
    """Servicio de reconocimiento facial usando AWS Rekognition"""

    def __init__(self):
        # Configuración de AWS
        self.region = "us-east-1"  # Cambiar por tu región
        self.collection_id = "condominio-faces"  # Colección de caras

        try:
            # Inicializar cliente de Rekognition
            self.client = boto3.client(
                "rekognition",
                region_name=self.region,
                aws_access_key_id=getattr(settings, "AWS_ACCESS_KEY_ID", ""),
                aws_secret_access_key=getattr(settings, "AWS_SECRET_ACCESS_KEY", ""),
            )
            self.available = True
            logger.info("AWS Rekognition configurado correctamente")
        except Exception as e:
            logger.error(f"Error configurando AWS Rekognition: {e}")
            self.client = None
            self.available = False

    def create_collection(self) -> Dict[str, Any]:
        """Crear colección de caras"""
        try:
            response = self.client.create_collection(CollectionId=self.collection_id)
            return {
                "exito": True,
                "mensaje": f"Colección '{self.collection_id}' creada exitosamente",
                "status_code": response["StatusCode"],
            }
        except self.client.exceptions.ResourceAlreadyExistsException:
            return {
                "exito": True,
                "mensaje": f"Colección '{self.collection_id}' ya existe",
            }
        except Exception as e:
            return {"exito": False, "error": f"Error creando colección: {str(e)}"}

    def index_face(
        self, image_bytes: bytes, face_id: str, external_image_id: str
    ) -> Dict[str, Any]:
        """Indexar una cara en la colección"""
        try:
            response = self.client.index_faces(
                CollectionId=self.collection_id,
                Image={"Bytes": image_bytes},
                ExternalImageId=external_image_id,
                MaxFaces=1,
                QualityFilter="AUTO",
                DetectionAttributes=["ALL"],
            )

            if response["FaceRecords"]:
                face_record = response["FaceRecords"][0]
                return {
                    "exito": True,
                    "face_id": face_record["Face"]["FaceId"],
                    "external_image_id": external_image_id,
                    "confidence": face_record["Face"]["Confidence"],
                    "bounding_box": face_record["Face"]["BoundingBox"],
                }
            else:
                return {
                    "exito": False,
                    "error": "No se detectó ninguna cara en la imagen",
                }

        except Exception as e:
            return {"exito": False, "error": f"Error indexando cara: {str(e)}"}

    def search_faces(
        self, image_bytes: bytes, threshold: float = 80.0
    ) -> Dict[str, Any]:
        """Buscar caras en la colección"""
        try:
            response = self.client.search_faces_by_image(
                CollectionId=self.collection_id,
                Image={"Bytes": image_bytes},
                FaceMatchThreshold=threshold,
                MaxFaces=10,
            )

            if response["FaceMatches"]:
                best_match = response["FaceMatches"][0]
                return {
                    "exito": True,
                    "face_found": True,
                    "face_id": best_match["Face"]["FaceId"],
                    "external_image_id": best_match["Face"]["ExternalImageId"],
                    "confidence": best_match["Face"]["Confidence"],
                    "similarity": best_match["Similarity"],
                    "bounding_box": best_match["Face"]["BoundingBox"],
                }
            else:
                return {
                    "exito": True,
                    "face_found": False,
                    "mensaje": "No se encontró ninguna cara coincidente",
                }

        except Exception as e:
            return {"exito": False, "error": f"Error buscando caras: {str(e)}"}

    def detect_faces(self, image_bytes: bytes) -> Dict[str, Any]:
        """Detectar caras en una imagen"""
        try:
            response = self.client.detect_faces(
                Image={"Bytes": image_bytes}, Attributes=["ALL"]
            )

            faces = []
            for face in response["FaceDetails"]:
                faces.append(
                    {
                        "confidence": face["Confidence"],
                        "bounding_box": face["BoundingBox"],
                        "emotions": [
                            emotion["Type"]
                            for emotion in face["Emotions"]
                            if emotion["Confidence"] > 50
                        ],
                        "age_range": {
                            "low": face["AgeRange"]["Low"],
                            "high": face["AgeRange"]["High"],
                        },
                        "gender": face["Gender"]["Value"]
                        if face["Gender"]["Confidence"] > 50
                        else None,
                    }
                )

            return {"exito": True, "faces_detected": len(faces), "faces": faces}

        except Exception as e:
            return {"exito": False, "error": f"Error detectando caras: {str(e)}"}

    def delete_face(self, face_id: str) -> Dict[str, Any]:
        """Eliminar una cara de la colección"""
        try:
            response = self.client.delete_faces(
                CollectionId=self.collection_id, FaceIds=[face_id]
            )

            return {
                "exito": True,
                "mensaje": f"Cara {face_id} eliminada exitosamente",
                "deleted_faces": response["DeletedFaces"],
            }

        except Exception as e:
            return {"exito": False, "error": f"Error eliminando cara: {str(e)}"}

    def list_faces(self) -> Dict[str, Any]:
        """Listar todas las caras en la colección"""
        try:
            response = self.client.list_faces(CollectionId=self.collection_id)

            faces = []
            for face in response["Faces"]:
                faces.append(
                    {
                        "face_id": face["FaceId"],
                        "external_image_id": face["ExternalImageId"],
                        "confidence": face["Confidence"],
                        "bounding_box": face["BoundingBox"],
                    }
                )

            return {"exito": True, "faces_count": len(faces), "faces": faces}

        except Exception as e:
            return {"exito": False, "error": f"Error listando caras: {str(e)}"}


# Instancia global
aws_rekognition_service = AWSRekognitionService()
