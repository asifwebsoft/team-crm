from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL


class Company(models.Model):

    name = models.CharField(max_length=255)

    # NEW FIELDS
    address = models.TextField(blank=True, null=True)

    contact_number = models.CharField(
        max_length=15,
        blank=True,
        null=True
    )

    email = models.EmailField(
        blank=True,
        null=True
    )

    gstin = models.CharField(
        max_length=20,
        blank=True,
        null=True
    )

    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='owned_companies'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name