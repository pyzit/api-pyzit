from django.shortcuts import render
from core.serializers import AnalyticSerializers
from rest_framework import status, viewsets
from core.models import InvoiceAnalysis, Tool
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.http import HttpResponse
from django.conf import settings
from rest_framework.decorators import action


class InvoiceAnalysisViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = InvoiceAnalysis.objects.all()
    serializer_class = AnalyticSerializers
    permission_classes = [AllowAny]

    @action(detail=False, methods=['get'])
    def latest(self, request):
        latest_obj = InvoiceAnalysis.objects.order_by('-id').first()
        serializer = self.get_serializer(latest_obj)
        return Response(serializer.data)


def widget_inline_js(request):
    tools = Tool.objects.all()
    for tool in tools:
        tool.logo_url = request.build_absolute_uri(tool.logo.url)

    response = render(request, 'widget/widget.js', {'tools': tools})
    response['Content-Type'] = 'application/javascript'
    response['Cache-Control'] = 'public, max-age=3600'
    return response

def index(request):
    return render(request, 'index.html')