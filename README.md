# ✈️ PackPilot MCP

### AI-Powered Smart Travel Assistant

**PackPilot MCP** is an AI-powered travel assistant that connects emails, calendars, tasks, and weather services to simplify travel preparation. It identifies missing packing essentials, detects schedule conflicts, and recommends solutions using AI and Model Context Protocol (MCP).

## 🚨 Problem Statement

Travellers manage flight tickets, meeting schedules, reservations, and packing lists across multiple disconnected applications. This leads to:

- Forgetting essential travel items.
- Missing meetings due to flight delays.
- Overlooking event and movie reservations.
- Difficulty coordinating schedules across multiple platforms.

## 💡 Our Solution

PackPilot provides a centralized intelligent travel assistant that:

- **Smart Travel Audit:** Collects travel information from emails, calendars, notes, and tasks.
- **Intelligent Packing:** Identifies missing essentials using checklists and real-time weather information.
- **Conflict Detection:** Detects scheduling clashes between flights, meetings, and entertainment bookings.
- **Smart Rescheduling:** Suggests alternative schedules and applies changes only after user approval.
- **AI Voice Briefings:** Provides hands-free travel updates using ElevenLabs.

## 🔄 Workflow

1. **Trigger Audit:** User initiates an audit or a flight-delay event triggers one.
2. **Collect Data:** MCP tools retrieve information from connected applications.
3. **Analyze:** AI detects missing essentials and schedule conflicts.
4. **Recommend:** Generates packing suggestions and schedule adjustments.
5. **Approve:** User reviews and approves proposed changes.
6. **Execute:** Updates approved tasks and calendars and generates a voice briefing.

## 🏗️ Tech Stack

| Component | Technology |
|---|---|
| Frontend | Next.js, Tailwind CSS |
| Backend | Python, FastAPI |
| MCP Integration | Python FastMCP SDK |
| AI Reasoning | Claude 3.5 Sonnet / Amazon Bedrock |
| Email & Calendar | Gmail API, Google Calendar API |
| Weather | Open-Meteo API |
| Database | Supabase PostgreSQL |
| Voice AI | ElevenLabs TTS & STT |

## 🔐 Security & Privacy

- Read-only access by default.
- Explicit user approval for calendar and task modifications.
- Permission-scoped MCP tools.
- Supabase-based audit logging.
- Structured data extraction for reliable information processing.

## 🎯 Target Users

- Students
- Corporate travellers
- Frequent flyers
- Families managing complex itineraries

## 🚀 Future Scope

- Real-time flight tracking and notifications.
- Group trip planning.
- Mobile application with push notifications.
- Personalized packing recommendations.
- Multilingual AI voice assistance.
- Integration with additional travel booking platforms.

## 👥 Team Tycho

**Institution:** MS Ramaiah Institute of Technology  
**Event:** wHACKiest 2026  
**Track:** I

| Name | Role |
|---|---|
| Nakul Arun Kumar K | Team Lead |
| Mayank M.P | Team Member |
| G V Ankeeth Sai | Team Member |
| Kritant Kritay Tripathi | Team Member |

---

### ❤️ Built with innovation by Team Tycho

**PackPilot MCP — Travel smarter. Stay prepared. Never miss a plan.**
