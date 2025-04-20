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