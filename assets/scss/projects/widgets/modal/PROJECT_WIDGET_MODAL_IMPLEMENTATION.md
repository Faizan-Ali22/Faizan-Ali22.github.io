# Project Widget Modal Implementation Guide

## Architecture Overview

The project widget modal system follows a strict separation between **server-side HTML generation (Hugo partials)** and **client-side interactions (JavaScript)**. This architecture ensures maintainability, performance, and adherence to best practices. All documentation and comment are in english! Never in French.

### Core Principles

1. **NO HTML generation in JavaScript** - All HTML structure must come from Hugo partials
2. **Complete implementations only** - Never implement temporary solutions or TODO placeholders
3. **Server-side rendering first** - Use Hugo's templating system for structure generation
4. **Minimal DOM manipulation** - JavaScript only handles interactions, not structure

## File Structure

```
themes/portfolio.theme/
├── assets/scss/projects/widgets/modal/
│   ├── _project-widget-base.scss      # Base modal styles
│   ├── _project-widget-{widget}.scss  # Specific widget styles
│   └── index.scss                     # Import all modal styles
├── assets/js/
│   └── unified-modal-system.js        # Modal interactions (NO HTML generation)
└── layouts/_partials/projects/widgets/modal/
    ├── {widget}.html          # Complex widget HTML structure
```

## Implementation Steps

### 1. Create Hugo Partial for HTML Structure

**Location**: `/layouts/_partials/projects/widgets/modal/{widget}.html`

**Template Structure**:
```html
{{/* Widget-specific Hugo partial */}}
{{/* Access project data via Hugo context: .Project, .Site, etc. */}}
<div class="widget-modal">
  <div class="widget-header">
    <h3>{{ .Title }}</h3>
  </div>
  <div class="widget-content">
    {{/* Use Hugo templating for data iteration */}}
    {{ range .Project.Params.widget_data }}
      <div class="widget-item">
        {{/* Hugo conditional logic */}}
        {{ if .field }}
          <span>{{ .field }}</span>
        {{ end }}
      </div>
    {{ end }}
  </div>
</div>
```

**Key Guidelines**:
- Use Hugo's templating syntax (`{{ }}`) for all dynamic content
- Access project data through Hugo context variables
- Implement complete HTML structure with all necessary elements
- Include proper accessibility attributes (aria-labels, roles)
- Use semantic HTML elements

### 2. Create SCSS Styles

**Location**: `/assets/scss/modal/_project-widget-{widget}.scss`

**Style Structure**:
```scss
// Widget-specific modal styles
.widget-modal{
  // Base widget container
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  .widget-header {
    // Header styling
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 0.5rem;
    
    h3 {
      margin: 0;
      color: var(--text-primary);
    }
  }
  
  .widget-content {
    // Content area styling
    display: grid;
    gap: 0.75rem;
    
    .widget-item {
      // Individual item styling
      padding: 0.5rem;
      border-radius: 0.375rem;
      background: var(--bg-secondary);
      
      // Hover effects
      transition: all 0.2s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
    }
  }
  
  // Responsive design
  @media (max-width: 768px) {
    .widget-content {
      grid-template-columns: 1fr;
    }
  }
}
```

**Import in index.scss**:
```scss
@import 'project-widget-{widget}';
```

### 3. Integrate Partial in Project Layout

**Location**: `/layouts/projects/single.html` or relevant template

**Integration Pattern**:
```html
{{/* Integration in project single page */}}
<div class="project-modal-content">
  {{/* Other project content */}}
  
  {{/* Widget integration */}}
  {{ if .Params.widget_data }}
    {{ partial "projects/widgets/modal/{widget}-.html" (dict "Project" . "Title" "Widget Title") }}
  {{ end }}
</div>
```

**Context Passing**:
- Pass project data through Hugo's `dict` function
- Include necessary context variables (Project, Site, Title, etc.)
- Ensure data availability in the partial

### 4. JavaScript Interactions (Minimal)

**Location**: `/assets/js/unified-modal-system.js`

**Interaction Pattern**:
```javascript
// Widget-specific interactions (NO HTML generation)
function initializeWidgetInteractions() {
  // Event listeners for widget interactions
  document.querySelectorAll('.widget-item').forEach(item => {
    item.addEventListener('click', function(e) {
      // Handle click interactions
      this.classList.toggle('active');
      
      // Trigger animations or state changes
      updateWidgetState(this);
    });
  });
}

function updateWidgetState(element) {
  // Update CSS classes, attributes, or data only
  // NO HTML structure manipulation
  const isActive = element.classList.contains('active');
  element.setAttribute('aria-expanded', isActive);
}

// Initialize when modal opens
document.addEventListener('modalOpened', function(e) {
  if (e.detail.modalType === 'project-widget') {
    initializeWidgetInteractions();
  }
});
```

**JavaScript Rules**:
- Only handle events, CSS classes, and attributes
- Use `querySelector`/`querySelectorAll` to find existing elements
- Trigger animations through CSS class toggling
- Update ARIA attributes for accessibility
- NO `createElement`, `innerHTML`, or HTML string manipulation

## Data Flow Architecture

### 1. Hugo Build Time
```
Project Data (frontmatter) → Hugo Partial → HTML Structure → SCSS Styling → Built Page
```

### 2. Runtime Interactions
```
User Interaction → JavaScript Event → CSS Class Toggle → Visual Update
```

### 3. Modal Opening Process
```
User Clicks → Modal System → Load Hugo-generated Content → Initialize JS Interactions
```

## Best Practices

### Hugo Partial Development
- **Access project data**: Use `.Project.Params.{field}` for frontmatter data
- **Conditional rendering**: Use `{{ if }}` for optional content
- **Data iteration**: Use `{{ range }}` for arrays/slices
- **Localization**: Use `i18n` functions for multilingual support
- **Performance**: Minimize computational logic in templates

### SCSS Development
- **CSS Variables**: Use CSS custom properties for theming
- **Responsive Design**: Include mobile-first breakpoints
- **Animation**: Use `transition` and `transform` for smooth effects
- **Accessibility**: Ensure sufficient contrast and focus indicators
- **Modularity**: Keep widget styles isolated and reusable

### JavaScript Development
- **Event Delegation**: Use efficient event handling patterns
- **Performance**: Minimize DOM queries and modifications
- **Accessibility**: Update ARIA attributes appropriately
- **Error Handling**: Include proper error handling for edge cases
- **Memory Management**: Remove event listeners when modal closes

## Common Patterns

### Widget with Statistics
```html
{{/* Hugo Partial */}}
<div class="stats-widget">
  {{ range .Stats }}
    <div class="stat-item" data-value="{{ .Value }}">
      <span class="stat-label">{{ .Label }}</span>
      <span class="stat-value">{{ .Value }}</span>
      <div class="stat-bar">
        <div class="stat-fill" style="width: {{ .Percentage }}%"></div>
      </div>
    </div>
  {{ end }}
</div>
```

### Interactive List Widget
```html
{{/* Hugo Partial */}}
<div class="list-widget">
  {{ range $index, $item := .Items }}
    <div class="list-item" data-index="{{ $index }}" tabindex="0">
      <div class="item-content">
        <h4>{{ .Name }}</h4>
        <p>{{ .Description }}</p>
      </div>
      <div class="item-actions">
        {{ if .Link }}
          <a href="{{ .Link }}" class="item-link">View</a>
        {{ end }}
      </div>
    </div>
  {{ end }}
</div>
```

### Filterable Content Widget
```html
{{/* Hugo Partial */}}
<div class="filter-widget">
  <div class="filter-controls">
    {{ $categories := .Categories }}
    {{ range $categories }}
      <button class="filter-btn" data-filter="{{ . }}">{{ . }}</button>
    {{ end }}
  </div>
  <div class="filter-content">
    {{ range .Items }}
      <div class="filter-item" data-category="{{ .Category }}">
        {{/* Item content */}}
      </div>
    {{ end }}
  </div>
</div>
```

## Testing Checklist

### Hugo Partial Testing
- [ ] Partial renders without errors
- [ ] All data fields are accessible
- [ ] Conditional logic works correctly
- [ ] Responsive layout functions properly
- [ ] Accessibility attributes are present

### SCSS Testing
- [ ] Styles apply correctly
- [ ] Responsive breakpoints work
- [ ] Hover/focus states function
- [ ] Color contrast meets accessibility standards
- [ ] Animations are smooth and performant

### JavaScript Testing
- [ ] Event listeners attach properly
- [ ] Interactions work as expected
- [ ] No HTML generation occurs
- [ ] Error handling prevents crashes
- [ ] Memory leaks are avoided

### Integration Testing
- [ ] Modal opens with correct content
- [ ] Widget integrates seamlessly
- [ ] Performance is acceptable
- [ ] Accessibility is maintained
- [ ] Cross-browser compatibility

## Troubleshooting

### Common Issues

**Partial not rendering**:
- Check file path and naming
- Verify context variables are passed correctly
- Ensure data exists in project frontmatter

**Styles not applying**:
- Confirm SCSS import in index.scss
- Check CSS specificity conflicts
- Verify CSS variable availability

**JavaScript not working**:
- Ensure DOM elements exist before querying
- Check event listener attachment timing
- Verify modal initialization sequence

**Performance issues**:
- Review DOM query frequency
- Optimize CSS selectors
- Minimize Hugo template complexity

### Debugging Tips

- Use Hugo's `{{ printf "%#v" .VariableName }}` to debug template variables
- Test partials in isolation before integration
- Use browser dev tools to verify generated HTML structure
- Check console for JavaScript errors during modal interactions

## Future Considerations

- **Caching**: Consider Hugo's caching mechanisms for complex widgets
- **Progressive Enhancement**: Ensure widgets work without JavaScript
- **Internationalization**: Plan for multilingual widget content
- **Performance**: Monitor build times and page load performance
- **Accessibility**: Regular accessibility audits and testing

This guide ensures consistent, maintainable, and performant project widget modals following the established architectural principles.