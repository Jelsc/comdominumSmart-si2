from rest_framework.routers import DefaultRouter

from .views import AreaComunViewSet

router = DefaultRouter()
router.register(r"", AreaComunViewSet, basename="areas-comunes")

urlpatterns = router.urls
