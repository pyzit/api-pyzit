from django.db import models

# Create your models here.


class InvoiceAnalysis(models.Model):
    users=models.CharField(max_length=255)
    invoices=models.CharField(max_length=255)

    def __str__(self):
        return f"Invoices: {self.invoices}, Users: {self.users}"
    
    class Meta: 
        verbose_name = "Invoice Analysis"
        verbose_name_plural = "Invoice Analyses"
        ordering = ['-id']
        

class Tool(models.Model):
    name = models.CharField(max_length=100)
    url = models.URLField()
    description = models.TextField(null=True, blank=True)
    logo = models.ImageField(upload_to="tool_logos/%Y/%m/%d")
    team = models.CharField(max_length=100, null=True, blank=True)
    documentation_url = models.URLField(null=True, blank=True)
    support_url = models.URLField(null=True, blank=True)
    owner = models.CharField(max_length=100, null=True, blank=True)
    version = models.CharField(max_length=50, null=True, blank=True)
    last_updated = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.name
    
    def logo_url(self, request=None):
        """
        Returns the absolute URL of the logo if request is provided,
        otherwise returns the relative URL.
        """
        if self.logo and hasattr(self.logo, 'url'):
            if request:
                return request.build_absolute_uri(self.logo.url)
            return self.logo.url
        return ''