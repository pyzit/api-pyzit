from django.urls import path, include
from rest_framework.routers import DefaultRouter
from core.views import InvoiceAnalysisViewSet, widget_inline_js, index

router = DefaultRouter()
router.register(r'invoiceAnalysis', InvoiceAnalysisViewSet, basename='invoice-analysis')

urlpatterns = [
    path('api/', include(router.urls)),
    
    
    
    path("tools/widget-inline.js", widget_inline_js, name="widget-inline"),
    path("", index, name="index"),
]
