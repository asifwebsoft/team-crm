from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from datetime import date
from .models import Lead
from accounts.models import User


# 🔐 STRICT EDIT PERMISSION
def can_edit_lead(user, lead):
    return lead.assigned_to == user


# 🔥 COMMON FILTER
def get_leads(user):
    if user.role == "admin":
        return Lead.objects.filter(company=user.company)

    elif user.role == "manager":
        team = User.objects.filter(company=user.company, manager=user)
        return Lead.objects.filter(
            company=user.company,
            assigned_to__in=list(team) + [user]
        )

    return Lead.objects.filter(
        company=user.company,
        assigned_to=user
    )


# ✅ CREATE
class CreateLeadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        lead = Lead.objects.create(
            title=request.data.get("title"),
            customer_name=request.data.get("customer_name"),
            phone=request.data.get("phone"),
            notes=request.data.get("notes"),
            followup_date=request.data.get("followup_date") or None,
            assigned_to=request.user,
            company=request.user.company
        )
        return Response({"id": lead.id})


# ✅ DASHBOARD
class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        leads = get_leads(request.user)
        today = date.today()

        return Response({
            "today_followups": list(leads.filter(followup_date=today).values()),
            "upcoming_followups": list(leads.filter(followup_date__gt=today).values()),
            "total_leads": leads.count(),
        })


# ✅ MY LEADS
class MyLeadsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        leads = get_leads(request.user)

        return Response([
            {
                "id": l.id,
                "title": l.title,
                "customer_name": l.customer_name,
                "phone": l.phone,
                "notes": l.notes,
                "status": l.status,
                "assigned_to": l.assigned_to.id if l.assigned_to else None,
                "followup_date": str(l.followup_date) if l.followup_date else None
            }
            for l in leads.order_by("-id")
        ])


# ✅ UPDATE
class UpdateLeadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            lead = Lead.objects.get(id=pk, company=request.user.company)
        except Lead.DoesNotExist:
            return Response({"error": "Not found"}, status=404)

        if not can_edit_lead(request.user, lead):
            return Response({"error": "Not allowed"}, status=403)

        lead.notes = request.data.get("notes", lead.notes)
        lead.followup_date = request.data.get("followup_date", lead.followup_date)
        lead.status = request.data.get("status", lead.status)

        lead.save()
        return Response({"message": "Updated"})


# ✅ DELETE
class DeleteLeadView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            lead = Lead.objects.get(id=pk, company=request.user.company)
        except Lead.DoesNotExist:
            return Response({"error": "Not found"}, status=404)

        if not can_edit_lead(request.user, lead):
            return Response({"error": "Not allowed"}, status=403)

        lead.delete()
        return Response({"message": "Deleted"})


# ✅ ASSIGN
class AssignLeadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            lead = Lead.objects.get(id=pk, company=request.user.company)
        except Lead.DoesNotExist:
            return Response({"error": "Not found"}, status=404)

        assign_id = request.data.get("assigned_to")

        try:
            user = User.objects.get(id=assign_id, company=request.user.company)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        # 🔐 manager restriction
        if request.user.role == "manager":
            if user.manager != request.user:
                return Response({"error": "Only your team"}, status=403)

        if request.user.role == "staff":
            return Response({"error": "Access denied"}, status=403)

        lead.assigned_to = user
        lead.save()

        return Response({"message": "Assigned"})


# ✅ NOTIFICATIONS
class NotificationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        leads = get_leads(request.user)
        today = date.today()

        data = []

        today_leads = leads.filter(
            followup_date=today
        ).exclude(status="closed")

        overdue_leads = leads.filter(
            followup_date__lt=today
        ).exclude(status="closed")

        for l in today_leads:

            data.append({
                "id": l.id,
                "name": l.customer_name,
                "title": getattr(l, "title", "Lead"),
                "type": "today",
                "date": str(l.followup_date)
            })

        for l in overdue_leads:

            data.append({
                "id": l.id,
                "name": l.customer_name,
                "title": getattr(l, "title", "Lead"),
                "type": "overdue",
                "date": str(l.followup_date)
            })

        return Response({
            "count": len(data),
            "data": data
        })


# ✅ FOLLOWUPS
class FollowupReminderView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        leads = get_leads(request.user)
        today = date.today()

        return Response({
            "today": leads.filter(followup_date=today).count(),
            "overdue": leads.filter(followup_date__lt=today).count(),
        })


# ✅ TEAM PERFORMANCE
class TeamPerformanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role == "admin":
            users = User.objects.filter(company=user.company).exclude(role="admin")
        elif user.role == "manager":
            users = User.objects.filter(
                company=user.company
            ).filter(Q(manager=user) | Q(id=user.id))
        else:
            users = [user]

        data = []

        for u in users:
            leads = Lead.objects.filter(company=user.company, assigned_to=u)

            total = leads.count()
            closed = leads.filter(status="closed").count()
            percent = round((closed / total) * 100, 2) if total else 0

            data.append({
                "name": u.full_name,
                "total": total,
                "closed": closed,
                "conversion": percent
            })

        return Response(sorted(data, key=lambda x: x["conversion"], reverse=True))


# ✅ CONVERSION (same as team performance)
class ConversionView(TeamPerformanceView):
    pass


# ✅ MANAGER DASHBOARD
class ManagerDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "manager":
            return Response({"error": "Access denied"}, status=403)

        leads = get_leads(request.user)
        today = date.today()

        return Response({
            "total": leads.count(),
            "closed": leads.filter(status="closed").count(),
            "today": leads.filter(followup_date=today).count()
        })