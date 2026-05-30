---
title: "Zombie Survival 2D"
# Short description for the card
description: "A 2D top-down shooter game featuring multiple enemy types, power-ups, and wave-based survival mechanics."
image: "/images/projects/zombie_survival.jpg"  # Don't forget to add the image you generated!

# "games-personnel" counts towards your "Games Created" stat
sector: "games-personnel"
date: 2024-05-18               # Must be unquoted, standard Hugo format!

actions:
  - label: "GitHub"
    type: "github"
    url: "https://github.com/Faizan-Ali22"
    primary: true              # Makes the button stand out more

status: "completed"
featured: true  # Set to true to show it on the Home page


programming_languages:
  - "pl_cpp"  # This tag requires the data entry below
# If you used a library like SFML or SDL, uncomment below:
frameworks_engines:
  - "fw_adobe_photoshop"
  - "fw_adobe_illustrator" 
tools: # <--- Valid, add a space after the dash
  - "VS-code"
  - "tool_github"
soft_skills:
- "skill_teamwork"
- "skill_communication"
- "skill_problem_solving"
- "skill_leadership"
- "skill_creativity"
- "skill_project_management"
specialties:
- "spec_video_game_development"
- "spec_game_design"
- "spec_level_design"
- "spec_oop"

draft: false
displayedInPortfolio: true
---

## Overview
Zombie Survival 2D is a top-down view shooter where the player fights for survival against waves of incoming enemies. Developed as a semester project for Object Oriented Programming , the game challenges players to defeat zombies while managing limited lives and utilizing strategic power-ups.

## Key Features
* **Wave-Based Progression:** The game features multiple levels where difficulty increases as new, more dangerous types of zombies spawn.
* **Diverse Enemies:** Players face off against distinct enemy types, including basic zombies, blocky Level 2 zombies, and spiky Level 3 variants.
* **Dynamic Power-Up System:** A unique "Power Giving Spider" spawns randomly to drop distinct advantages:
    * **Shield:** Protects the player from damage.
    * **Faster Shots:** Increases fire rate.
    * **Triple Shots:** Allows the player to fire three projectiles at once.
* **Scoring & Lives:** The player starts with 3 lives, and the score increases as enemies are defeated.

## Technical Highlights
This project demonstrates core OOP concepts, including:
* **Polymorphism:** Handling different behaviors for various Zombie types and Power-ups.
* **Game Loop & Logic:** Managing spawn rates, collision detection, and score tracking.
* **State Management:** Tracking player lives, active power-up states, and level progression.