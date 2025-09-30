"""
Vistas para reconocimiento facial con AWS Rekognition
"""

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.views import View
import json
import base64
import logging

from .aws_rekognition_api import aws_rekognition_service

logger = logging.getLogger(__name__)


@csrf_exempt
@require_http_methods(["POST"])
def detect_faces(request):
    """Detectar caras en una imagen"""
    try:
        if "imagen" not in request.FILES:
            return JsonResponse(
                {"exito": False, "error": "No se proporcionó imagen"}, status=400
            )

        imagen = request.FILES["imagen"]
        imagen_bytes = imagen.read()

        if not aws_rekognition_service.available:
            return JsonResponse(
                {"exito": False, "error": "AWS Rekognition no está configurado"},
                status=500,
            )

        resultado = aws_rekognition_service.detect_faces(imagen_bytes)
        return JsonResponse(resultado)

    except Exception as e:
        logger.error(f"Error en detección de caras: {e}")
        return JsonResponse(
            {"exito": False, "error": f"Error interno: {str(e)}"}, status=500
        )


@csrf_exempt
@require_http_methods(["POST"])
def register_face(request):
    """Registrar una cara en la colección"""
    try:
        if "imagen" not in request.FILES:
            return JsonResponse(
                {"exito": False, "error": "No se proporcionó imagen"}, status=400
            )

        # Obtener datos del formulario
        residente_id = request.POST.get("residente_id", "")
        nombre = request.POST.get("nombre", "")

        if not residente_id or not nombre:
            return JsonResponse(
                {"exito": False, "error": "Se requiere residente_id y nombre"},
                status=400,
            )

        imagen = request.FILES["imagen"]
        imagen_bytes = imagen.read()

        if not aws_rekognition_service.available:
            return JsonResponse(
                {"exito": False, "error": "AWS Rekognition no está configurado"},
                status=500,
            )

        # Crear colección si no existe
        collection_result = aws_rekognition_service.create_collection()
        if not collection_result["exito"]:
            return JsonResponse(collection_result, status=500)

        # Indexar cara
        external_image_id = f"{residente_id}_{nombre}"
        resultado = aws_rekognition_service.index_face(
            imagen_bytes, residente_id, external_image_id
        )

        return JsonResponse(resultado)

    except Exception as e:
        logger.error(f"Error registrando cara: {e}")
        return JsonResponse(
            {"exito": False, "error": f"Error interno: {str(e)}"}, status=500
        )


@csrf_exempt
@require_http_methods(["POST"])
def recognize_face(request):
    """Reconocer una cara en la colección"""
    try:
        if "imagen" not in request.FILES:
            return JsonResponse(
                {"exito": False, "error": "No se proporcionó imagen"}, status=400
            )

        imagen = request.FILES["imagen"]
        imagen_bytes = imagen.read()

        if not aws_rekognition_service.available:
            return JsonResponse(
                {"exito": False, "error": "AWS Rekognition no está configurado"},
                status=500,
            )

        # Buscar cara en la colección
        resultado = aws_rekognition_service.search_faces(imagen_bytes)

        if resultado["exito"] and resultado.get("face_found"):
            return JsonResponse(
                {
                    "exito": True,
                    "cara_encontrada": True,
                    "residente_id": resultado["external_image_id"].split("_")[0],
                    "nombre": resultado["external_image_id"].split("_")[1],
                    "confidence": resultado["confidence"],
                    "similarity": resultado["similarity"],
                }
            )
        else:
            return JsonResponse(
                {
                    "exito": True,
                    "cara_encontrada": False,
                    "mensaje": "No se encontró ninguna cara registrada",
                }
            )

    except Exception as e:
        logger.error(f"Error reconociendo cara: {e}")
        return JsonResponse(
            {"exito": False, "error": f"Error interno: {str(e)}"}, status=500
        )


@csrf_exempt
@require_http_methods(["GET"])
def list_registered_faces(request):
    """Listar caras registradas"""
    try:
        if not aws_rekognition_service.available:
            return JsonResponse(
                {"exito": False, "error": "AWS Rekognition no está configurado"},
                status=500,
            )

        resultado = aws_rekognition_service.list_faces()
        return JsonResponse(resultado)

    except Exception as e:
        logger.error(f"Error listando caras: {e}")
        return JsonResponse(
            {"exito": False, "error": f"Error interno: {str(e)}"}, status=500
        )


@csrf_exempt
@require_http_methods(["DELETE"])
def delete_face(request):
    """Eliminar una cara de la colección"""
    try:
        data = json.loads(request.body)
        face_id = data.get("face_id")

        if not face_id:
            return JsonResponse(
                {"exito": False, "error": "Se requiere face_id"}, status=400
            )

        if not aws_rekognition_service.available:
            return JsonResponse(
                {"exito": False, "error": "AWS Rekognition no está configurado"},
                status=500,
            )

        resultado = aws_rekognition_service.delete_face(face_id)
        return JsonResponse(resultado)

    except Exception as e:
        logger.error(f"Error eliminando cara: {e}")
        return JsonResponse(
            {"exito": False, "error": f"Error interno: {str(e)}"}, status=500
        )
