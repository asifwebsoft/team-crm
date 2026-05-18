from django.db import models
from django.conf import settings
from accounts.models import User
from companies.models import Company

User = settings.AUTH_USER_MODEL

class Lead(models.Model):
    title = models.CharField(max_length=255)
    customer_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    notes = models.TextField(blank=True)
    followup_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=50, default="new")

    assigned_to = models.ForeignKey(
    User,
    on_delete=models.SET_NULL,
    null=True,
    blank=True
)
    
    company = models.ForeignKey(
    Company,
    on_delete=models.CASCADE,
    null=True,
    blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)


class LeadFollowupHistory(models.Model):

    lead = models.ForeignKey(
        "Lead",
        on_delete=models.CASCADE,
        related_name="followups"
    )

    notes = models.TextField()

    next_followup_date = models.DateField(
        null=True,
        blank=True
    )

    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE
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

        return (
            f"{self.lead.name} - "
            f"{self.created_by.full_name}"
        )