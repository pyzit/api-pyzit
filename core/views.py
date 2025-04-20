from django.shortcuts import render
from core.serializers import AnalyticSerializers
from rest_framework import status, viewsets
from core.models import InvoiceAnalysis
from rest_framework.response import Response
from rest_framework.permissions import AllowAny



class InvoiceAnalysisViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = InvoiceAnalysis.objects.all()
    serializer_class = AnalyticSerializers
    permission_classes = [AllowAny]  
