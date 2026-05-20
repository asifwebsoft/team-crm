from django.urls import path
from .views import CreateCompanyView, UpdateCompanyView

urlpatterns = [
    path('create/', CreateCompanyView.as_view()),
    path('company/update/',UpdateCompanyView.as_view()
),
]