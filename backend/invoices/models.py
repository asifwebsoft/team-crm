from django.db import models
from django.conf import settings
from companies.models import Company
from leads.models import Lead

User = settings.AUTH_USER_MODEL


class Invoice(models.Model):

    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("paid", "Paid"),
        ("partial", "Partial"),
    )

    invoice_number = models.CharField(
        max_length=50,
        unique=True
    )

    lead = models.ForeignKey(
        Lead,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    customer_name = models.CharField(max_length=255)

    phone = models.CharField(
        max_length=20,
        blank=True
    )

    address = models.TextField(
    blank=True,
    null=True
    )

    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending"
    )

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True
    )

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.invoice_number


class InvoiceItem(models.Model):

    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.CASCADE,
        related_name="items"
    )

    product_name = models.CharField(max_length=255)

    quantity = models.IntegerField(default=1)

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    subtotal = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    def __str__(self):
        return self.product_name