📂 MODULE 5.5: FULL-PAGE TEAM IMMERSION (Profile Redesign)
Current Status: The profile feels "boxed in." Team identity (colors/numbers) is restricted to a small card on the left. Target State: "Atmospheric Immersion." The entire page must feel like the user is inside their specific Team Garage. The Team Identity must bleed across the entire screen, affecting backgrounds, charts, and data streams.

1. 🎨 Global Styling Strategy (The "Team_OS" Theme)
Objective: Instead of hardcoding colors in individual components, apply a dynamic CSS Variable wrapper to the root of the Profile Page.

Action: Wrap the entire page content in a div that injects the selected team's color tokens.

TypeScript
// ProfilePage.tsx (Root Wrapper)
const team = GRID_DATA[user.favoriteTeam]; // Get team config

return (
  <div 
    className="min-h-screen relative w-full overflow-hidden bg-[#0F1115]"
    style={{ 
      // Define Global Variables
      "--team-color": team.color,       // Main Brand Color (e.g., #FF1801)
      "--team-dim": `${team.color}15`,  // Low Opacity (Backgrounds)
      "--team-glow": `${team.color}60`  // Medium Opacity (Glows)
    } as React.CSSProperties}
  >
    {/* Page Content Goes Here */}
  </div>
);
2. 🏎️ The "Mega-Number" Background
Critique: The driver number is currently trapped inside the left card. Fix: Move it to the Global Page Background. It must be massive and bleed off the screen.

Implementation:
Placement: Direct child of the Root Wrapper (behind all content).
Position: Fixed, Bottom-Right corner.
Size: text-[40rem] (approx 600px).
Z-Index: 0 (Behind everything).
Style:
Font: Racing Sans One or Eurostile.
Stroke: 2px solid line.
Fill: transparent.
Color: rgba(255, 255, 255, 0.03) (Subtle White/Grey). Do NOT use team color here (it distracts from data).
TypeScript
{/* Background Layer */}
<div className="fixed -bottom-20 -right-20 select-none pointer-events-none z-0">
  <span 
    className="font-racing text-[40rem] leading-none text-transparent opacity-10"
    style={{ WebkitTextStroke: '2px rgba(255,255,255,0.1)' }}
  >
    {driver.number} {/* e.g. "16" */}
  </span>
</div>
3. 📊 "Team_OS" Telemetry (Right Column Updates)
Critique: The charts and stats use generic Cyan/Green colors. Fix: All data visualizations must inherit var(--team-color).

A. The Radar Chart (Performance Matrix)
Update the charting library (Recharts/Chart.js) to use the CSS variable.
Stroke: var(--team-color) (Solid Line).
Fill: var(--team-color) with 30% Opacity.
Dots: Solid var(--team-color).
B. The Stats Strip (Top Row)
Big Numbers: Change text color to text-[color:var(--team-color)].
Labels: Keep them Grey (text-gray-500).
C. The Borders & Containers
Panel Borders: Change from border-gray-800 to border-[color:var(--team-dim)].
Effect: This makes the glass panels look like they are tinted with the team's hue.
4. 🛡️ Asset & Logo Polish
Critique: The Avatar is currently a letter "S" or "Y". It must be the Logo.

A. The Avatar (Left Column)
Logic: Force render the team.logo SVG.
Fallback: If SVG fails, render the Team Initials (e.g., "SF", "MCL") in the Team Font. Never use the User's Initial.
Style: The ring around the avatar must be border-[color:var(--team-color)] and glow.
B. The Page Watermark
Action: Add a Second Team Logo as a huge watermark behind the Right Column content.
Style: Greyscale, 5% Opacity, Centered behind the charts.
Why: This creates texture on the right side of the screen to balance the left side.
5. 📝 Implementation Checklist for Agent
[ ] Refactor Root: Implement the style={{ "--team-color": ... }} wrapper in ProfilePage.tsx.
[ ] Move Number: Delete the driver number from the Left Card. Create the "Mega-Number" background component.
[ ] Update Telemetry: Change all hardcoded "Cyan/Green" values in ProfileTelemetry.tsx to use var(--team-color).
[ ] Fix Avatar: Ensure team.logo is rendering. Remove the user's initial.
[ ] Verify Mobile: Ensure the Mega-Number doesn't overlap text on small screens (set z-index: -1).