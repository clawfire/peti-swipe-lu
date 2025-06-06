# 🧡 PETINDER – Swipe Your Way Into Democracy

**PETINDER** is a playful prototype that reimagines civic engagement by turning Luxembourg’s public petition platform into a swipeable, mobile-friendly experience.  
Built during a hackathon, this project was also an **experiment in coding with AI agents** to evaluate how far we can go with minimal manual intervention.

[♻️ Published re-use on data.public.lu](https://data.public.lu/fr/reuses/petinder/).

## 🚀 What It Does

* Fetches and displays live petitions from the Chambre des Députés via a reverse-engineered API
* Presents petitions in a Tinder-like UI for quick discovery
* Enables users to swipe through and engage with active petitions
* Uses localStorage to track interactions
* Parses and serves cleaned JSON data via Edge Functions

## 🎯 What’s the Problem?

Public petitions are powerful civic tools—but let’s be honest, they’re buried in clunky interfaces, feel a bit stark, and struggle to reach younger audiences.
I wanted to test if a **Tinder-style interface**, built fast and mostly by AI, could make democratic engagement feel natural, quick… even fun.

## ⚙️ Tech Stack & Process

* 💅 Frontend Framework: Lovable.dev
  * Vite
  * TypeScript
  * React
  * shadcn-ui
  * Tailwind CSS
* 🧠 AI-driven development: 99% of the code was written by ChatGPT & GitHub Copilot
* ✍️ Manual edits: A few quick fixes made in the IDE
* 🌐 Data source: Unofficial API of the Chambre des Députés
* 🧾 Edge function: Parses raw JSON and serves cleaned petition data
* 💾 LocalStorage: Used to store swipe state without accounts or sessions

## 💡 Hackathon Context

This wasn’t just about building a cool civic tech tool.  
It was about **testing what AI coding agents can accomplish** in a high-pressure, short-timeframe environment like a hackathon — versus the more structured, collaborative pace of traditional dev work.

*	⏱️ ~2 hours to MVP
* 🤖 AI wrote almost everything
* 🧪 Experiment in AI-assisted software delivery

## 📱 Try It

👉 [Live Demo](https://peti-swipe-lu.lovable.app/)

## 🧠 Features

* Swipe through petitions like you’re browsing a dating app
* Simple UI optimized for mobile
* Real-time(ish) data from the parliamentary site
* Easy way to “engage on impulse” — no account required

## 🛠 Usage (for devs)

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone https://github.com/clawfire/peti-swipe-lu.git

# Step 2: Navigate to the project directory.
cd peti-swipe-lu

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## 📦 Data Info

* Sources: https://www.petitiounen.lu/petition-web-back-for-front/petitions and https://data.public.lu/fr/datasets/la-liste-des-petitions/
* Some fields missing (e.g., petition deadline) from the open dataset, so JSON is taken from the website unofficial API, cleaned and stored manually via an edge function

## 🤝 Reuse & Remix

All code is public. Fork it, remix it, or use it to build civic tech in your own country.

> public money = public code

## ✨ Author

**Thibault Milan**  
🔗 [thibaultmilan.com](https://thibaultmilan.com)  
🦋 [@thibau.lt](https://bsky.app/profile/thibau.lt)
