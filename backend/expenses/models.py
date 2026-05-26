from django.db import models

from companies.models import Company

from django.conf import settings


class Expense(models.Model):

    CATEGORY_CHOICES = (

        ("salary", "Salary"),

        ("rent", "Rent"),

        ("electricity", "Electricity"),

        ("internet", "Internet"),

        ("marketing", "Marketing"),

        ("transport", "Transport"),

        ("other", "Other"),
    )

    company = models.ForeignKey(

        Company,

        on_delete=models.CASCADE,

        related_name="expenses"
    )

    category = models.CharField(

        max_length=50,

        choices=CATEGORY_CHOICES
    )

    amount = models.DecimalField(

        max_digits=10,

        decimal_places=2
    )

    note = models.TextField(

        blank=True,

        null=True
    )

    expense_date = models.DateField()

    created_by = models.ForeignKey(

        settings.AUTH_USER_MODEL,

        on_delete=models.SET_NULL,

        null=True
    )

    created_at = models.DateTimeField(

        auto_now_add=True
    )

    def __str__(self):

        return (
            f"{self.category} - ₹{self.amount}"
        )