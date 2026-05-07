
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/leads/', include('leads.urls')),
    path('api/company/', include('companies.urls')),
    path('api/subscription/', include('subscriptions.urls')),
    path('api/token/refresh/', TokenRefreshView.as_view()),
]
