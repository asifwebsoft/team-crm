from django.contrib import admin
from .models import Subscription


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'plan', 'is_active', 'start_date', 'end_date')
    list_filter = ('plan', 'is_active')
    search_fields = ('user__username',)