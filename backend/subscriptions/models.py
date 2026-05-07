from django.db import models
from django.conf import settings
from datetime import timedelta
from django.utils.timezone import now

User = settings.AUTH_USER_MODEL

class Subscription(models.Model):
    PLAN_CHOICES = (
        ('basic', 'Basic'),
        ('pro', 'Pro'),
        ('advance', 'Advance'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    plan = models.CharField(max_length=20, choices=PLAN_CHOICES)
    is_active = models.BooleanField(default=False)
    start_date = models.DateTimeField(default=now)
    end_date = models.DateTimeField()

    def save(self, *args, **kwargs):
        # 👇 plan ke basis pe expiry set karo
        if not self.end_date:
            if self.plan == 'basic':
                self.end_date = now() + timedelta(days=30)
            elif self.plan == 'pro':
                self.end_date = now() + timedelta(days=90)
            elif self.plan == 'advance':
                self.end_date = now() + timedelta(days=365)

        super().save(*args, **kwargs)