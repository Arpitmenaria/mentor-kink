# Organization Mentor - Design System

Based on Kick Analyst Admin Panel Design

## 🎨 COLOR PALETTE

### Primary Colors
```css
--background:         #080c16  /* Deep dark blue */
--card:               #0d1321  /* Card sections */
--surface-alt:        #0a1020  /* Alternative surface */
--surface-sidebar:    #0b0f1e  /* Sidebar background */
--surface-card:       #0f1728  /* Brand cards */
```

### Text Colors
```css
--foreground:         #f0f4ff  /* Main text (off white) */
--muted:              #111e33  /* Dark text */
--muted-foreground:   #4a5a7a  /* Secondary text */
--caption-text:       #9ba3b0  /* Subtitles */
--dim-text:           #3a4d68  /* Very muted */
--subtle-text:        #4d6480  /* Muted labels */
```

### UI Elements
```css
--primary:            #2563eb  /* Blue - buttons, links, accents */
--primary-foreground: #ffffff  /* White on blue */
--border:             rgba(255,255,255,0.07)  /* Subtle borders */
--destructive:        #ef4444  /* Red - error, delete */
```

### Navigation
```css
--nav-active:         #ADB5CE  /* Active menu items */
--nav-inactive:       #BEC7D4  /* Inactive menu */
--nav-pill-bg:        #3E465C  /* Active nav background */
```

### Icons & Components
```css
--icon-muted:         #8899b4  /* Header icons */
--stat-icon:          #4d6b90  /* Stat card icons */
--tooltip-bg:         #1e2d45  /* Hover tooltips */
--tooltip-text:       #dce8f8  /* Tooltip content */
```

---

## 🔤 TYPOGRAPHY

### Font Family
```css
font-family: "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif;
font-family-mono: "JetBrains Mono", monospace;
```

### Font Sizes & Weights
- **Labels:** 10.5px, weight 600, uppercase, letter-spacing 0.1em
- **Body:** 14px - 16px, weight 400
- **Headings (H1):** 24px - 28px, weight 700, line-height 1.2
- **Headings (H2):** 20px - 24px, weight 600, line-height 1.2
- **Headings (H3):** 16px - 18px, weight 600, line-height 1.2
- **Small Text:** 12px, weight 400, line-height 1.5
- **Captions:** 11px - 12px, weight 400, color #9ba3b0

---

## 🎯 SPACING & SIZING

### Border Radius
```css
--radius: 0.625rem; /* 10px - standard radius */
--radius-sm: 0.375rem; /* 6px - small elements */
--radius-lg: 0.875rem; /* 14px - large elements */
```

### Padding
- **Page/Container:** 24px (desktop), 16px (mobile)
- **Cards:** 24px - 32px
- **Buttons:** 12px (horizontal), 8px (vertical)
- **Input Fields:** 12px (padding)

### Margins
- **Between sections:** 20px - 32px
- **Between cards:** 16px - 24px
- **Icon spacing:** 8px - 12px

### Icon Sizes
- **Header/Nav:** 20px - 24px
- **Stat Cards:** 24px - 28px
- **Small Icons:** 16px - 18px

### Component Heights
- **Header:** 60px - 80px
- **Nav Items:** 40px - 48px
- **Buttons:** 40px - 44px
- **Input Fields:** 40px - 44px
- **Table Rows:** 48px - 56px

---

## 🧩 COMPONENT STYLES

### Sidebar
```css
background:      #0b0f1e;
width:           240px - 280px;
border:          rgba(255,255,255,0.07);
border-radius:   0.625rem;

/* Active Item */
background:      #3E465C;
color:           #ADB5CE;
border-radius:   8px;
padding:         8px 12px;

/* Hover */
opacity:         0.8;
background:      rgba(59,130,246,0.1);
```

### Cards/Panels
```css
background:      #0d1321;
border:          rgba(255,255,255,0.07);
padding:         20px - 24px;
border-radius:   0.625rem;
box-shadow:      none; /* Flat design */
```

### Buttons
```css
/* Primary */
background:      #2563eb;
color:           white;
border-radius:   0.625rem;
padding:         8px 16px;
font-weight:     600;
font-size:       13px;
text-transform:  uppercase;

/* Hover */
opacity:         0.9;
transform:       translateY(-1px);

/* Focus */
outline:         2px solid rgba(59,130,246,0.5);
outline-offset:  2px;

/* Disabled */
opacity:         0.5;
cursor:          not-allowed;
```

### Input Fields
```css
background:      #111e33;
border:          rgba(255,255,255,0.07);
color:           #f0f4ff;
border-radius:   0.625rem;
padding:         12px 16px;
font-size:       14px;

/* Placeholder */
color:           #4a5a7a;

/* Focus */
border-color:    #2563eb;
outline:         2px solid rgba(59,130,246,0.5);
box-shadow:      0 0 0 3px rgba(59,130,246,0.1);
```

### Badge/Status
```css
/* Live/Active */
background:      rgba(16,185,129,0.2);
color:           #10b981;
border:          1px solid rgba(16,185,129,0.3);

/* Draft */
background:      #111e33;
color:           #4a5a7a;

/* Archived/Destructive */
background:      rgba(239,68,68,0.2);
color:           #ef4444;
border:          1px solid rgba(239,68,68,0.3);
```

### Tables
```css
/* Header */
background:      #0a1020;
color:           #4a5a7a;
font-size:       11px;
font-weight:     600;
text-transform:  uppercase;
padding:         12px 16px;

/* Row */
background:      #0d1321;
border-bottom:   rgba(255,255,255,0.04);
padding:         16px;

/* Row Hover */
background:      #111e33;
opacity:         0.6;
```

### Search/Filter
```css
background:      #111e33;
border:          rgba(255,255,255,0.07);
color:           #f0f4ff;
padding:         12px 16px;
border-radius:   0.625rem;
display:         flex;
align-items:     center;
gap:             12px;

/* Focus */
border-color:    #2563eb;
box-shadow:      0 0 0 3px rgba(59,130,246,0.1);
```

---

## ✨ EFFECTS & INTERACTIONS

### Focus States
```css
outline:         2px solid rgba(59,130,246,0.5);
outline-offset:  2px;
border-radius:   4px;
```

### Selection
```css
background:      rgba(59,130,246,0.35);
color:           white;
```

### Transitions
```css
transition:      all 200ms ease-in-out;
transition-property: opacity, background-color, color, transform, border-color;
```

### Hover Effects
- **Scale:** 0.98 - 1.02
- **Opacity:** 0.8 - 1.0
- **Background:** Subtle darkening/lightening

### Scrollbar (Webkit)
```css
::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.08);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255,255,255,0.14);
}
```

---

## 💻 CSS CUSTOM PROPERTIES (Root)

```css
:root {
  /* Colors */
  --background:         #080c16;
  --foreground:         #f0f4ff;
  --card:               #0d1321;
  --card-foreground:    #f0f4ff;
  --muted:              #111e33;
  --muted-foreground:   #4a5a7a;
  --primary:            #2563eb;
  --primary-foreground: #ffffff;
  --border:             rgba(255,255,255,0.07);
  --destructive:        #ef4444;
  
  /* App-specific */
  --color-surface-alt:       #0a1020;
  --color-surface-sidebar:   #0b0f1e;
  --color-surface-card:      #0f1728;
  --color-dim:               #3a4d68;
  --color-subtle:            #4d6480;
  --color-icon-muted:        #8899b4;
  --color-stat-icon:         #4d6b90;
  --color-nav-active:        #ADB5CE;
  --color-nav-inactive:      #BEC7D4;
  --color-nav-pill:          #3E465C;
  --color-tooltip-bg:        #1e2d45;
  --color-tooltip-text:      #dce8f8;
  --color-caption:           #9ba3b0;
  
  /* Sizing */
  --radius:              0.625rem;
  --radius-sm:           0.375rem;
  --radius-lg:           0.875rem;
  
  /* Transitions */
  --transition:          200ms ease-in-out;
}
```

---

## 📝 IMPLEMENTATION NOTES

1. **Use CSS variables** for all colors and sizing
2. **Apply consistently** across all components
3. **Maintain 200ms transitions** for smooth interactions
4. **Follow spacing** guidelines strictly
5. **Use system fonts** with fallbacks
6. **Implement focus states** for accessibility
7. **Test scrollbars** in webkit browsers

**Status:** Ready to apply to organization-mentor Members page ✅
