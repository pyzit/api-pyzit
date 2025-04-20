from django.urls import path, include
from rest_framework.routers import DefaultRouter
from core.views import InvoiceAnalysisViewSet  

router = DefaultRouter()
router.register(r'invoiceAnalysis', InvoiceAnalysisViewSet, basename='invoice-analysis')

urlpatterns = [
    path('api/', include(router.urls)),
]
