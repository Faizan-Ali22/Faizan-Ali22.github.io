---
title: "VR Industrial Training Tools"
weight: 11
description: "Client project: built a Unity XR jigsaw-machine and trade tools simulation library with cutting physics, custom shaders, Addressables architecture, and realistic haptics."
image: "/images/projects/vr_industrial_training.png"

date: 2026-02-15

actions:
  - label: "GitHub"
    type: "github"
    url: "https://github.com/Faizan-Ali22/Tools-Workshop-Vr"
    primary: true
  - label: "Watch Demo"
    type: "youtube"
    url: "https://www.youtube.com/watch?v=placeholder"

sector: "vr-professionnel"
status: "Completed"
featured: true

programming_languages:
  - "pl_csharp"
frameworks_engines:
  - "fw_unity"
  - "fw_blender"
  - "fw_adobe_photoshop"
tools:
  - "tool_unity_xr"
  - "tool_oculus_sdk"
  - "tool_visual_studio"
  - "tool_jira"
  - "tool_github"
soft_skills:
  - "skill_problem_solving"
  - "skill_leadership"
  - "skill_project_management"
  - "skill_teamwork"
  - "skill_communication"
specialties:
  - "spec_vr_development"
  - "spec_gameplay_dev"
  - "spec_oop"
  - "spec_3d_design"

technical_specs:
  - label: "Architecture"
    value: "Unity Addressables & 15–20 Reusable Behavior Archetypes"
  - label: "Mechanics"
    value: "Custom cutting mechanics, blade oscillation & motor simulation"
  - label: "Shaders & FX"
    value: "Custom HLSL cutting shader, dynamic particles & sparks"
  - label: "Diagnostics"
    value: "Fixed native-object memory leaks & oversized texture formats"

draft: false
displayedInPortfolio: true
---

## Overview
Engineered a comprehensive runtime VR tool simulation library for a client's large catalog of industrial trade equipment using **Unity XR** and **Blender**. The flagship implementation featured a virtual jigsaw machine and 5 interactive industrial tools (including an angle grinder and related workshop equipment) engineered for realistic physical interactions, cutting mechanics, and tactile feedback.

## Key Technical Highlights
* **Extensible Runtime Tool Library**: Architected a modular runtime tool SDK built around Unity **Addressables** for asset streaming and memory management, abstracting tool behaviors into 15–20 reusable object-oriented archetypes for rapid expansion across dozens of trade tools.
* **Realistic Cutting Mechanics & Motor Simulation**: Programmed high-fidelity tool dynamics including trigger-sensitive motor speed curves, blade oscillation physics, material resistance calculation, and dynamic workpiece splitting.
* **Custom Cutting Shader & Visual FX**: Authored custom shaders and particle effects to represent kerf grooves, sawdust ejection, sparking surfaces, and dynamic material wear in real-time.
* **Tactile Haptic & Audio Feedback**: Calibrated dual-controller multi-frequency haptics synchronized with motor RPM and cutting load alongside spatialized directional audio recordings.
* **Profiling & Memory Optimization**: Diagnosed and resolved native-object memory leaks during scene transitions and corrected an oversized-texture-format bug, drastically reducing RAM footprints and eliminating hitching on VR runtime hardware.
