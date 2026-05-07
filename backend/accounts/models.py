from django.contrib.auth.models import AbstractUser
from django.db import models
from companies.models import Company
from django.utils import timezone


class User(AbstractUser):
    ROLE_CHOICES = (
        ("admin", "Admin"),
        ("manager", "Manager"),
        ("staff", "Staff"),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="staff")

    # ✅ SAFE ADD (no breaking)
    full_name = models.CharField(max_length=100, blank=True)
    mobile = models.CharField(max_length=15, blank=True)

    # ⚠️ SAFE: अभी unique नहीं (migration issue avoid)
    email = models.EmailField(blank=True, null=True)

    company = models.ForeignKey(
        Company,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="users"
    )

    manager = models.ForeignKey(
    "self",
    on_delete=models.SET_NULL,
    null=True,
    blank=True,
    related_name="team_members"
    )

    def __str__(self):
        return self.email if self.email else self.username


class LoginActivity(models.Model):
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE)
    login_time = models.DateTimeField(auto_now_add=True)
    logout_time = models.DateTimeField(null=True, blank=True)

    def duration(self):
        if self.logout_time:
            return self.logout_time - self.login_time
        return None

    def __str__(self):
        return f"{self.user.email} - {self.login_time}"