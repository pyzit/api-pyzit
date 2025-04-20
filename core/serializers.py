from rest_framework import serializers
from core.models import InvoiceAnalysis

class AnalyticSerializers(serializers.ModelSerializer):
    class Meta:
        model = InvoiceAnalysis
        fields = '__all__'