# Get Localized Data Utility

This partial utility automatically loads the correct language version of data files.

## Purpose

Hugo does not automatically load localized data files (e.g., `profile.en.json`) when accessing `.Site.Data.profile`. This utility handles the language detection and loading logic for you.

## Usage

```hugo
{{- $profile := partial "get-localized-data.html" (dict "context" . "dataName" "profile") -}}
{{- $config := partial "get-localized-data.html" (dict "context" . "dataName" "config") -}}
{{- $icons := partial "get-localized-data.html" (dict "context" . "dataName" "icons") -}}
```

## Parameters

- **context** (required): The page context, usually `.`
- **dataName** (required): The base name of the data file (without extension)

## How It Works

1. Detects the current language from `$context.Site.Language.Lang`
2. Loads the default language data file: `data/{dataName}.json`
3. If the current language is not the default:
   - Attempts to load `data/{dataName}.{lang}.json`
   - Falls back to default if localized version doesn't exist

## Examples

### Loading Profile Data
```hugo
{{- $profile := partial "get-localized-data.html" (dict "context" . "dataName" "profile") -}}
<h1>{{ $profile.personal.fullName }}</h1>
<p>{{ $profile.personal.subtitle }}</p>
```

**Result:**
- FR page → loads `data/profile.json`
- EN page → loads `data/profile.en.json`

### Loading Config Data
```hugo
{{- $config := partial "get-localized-data.html" (dict "context" . "dataName" "config") -}}
{{ range $config.social }}
  <a href="{{ .url }}">{{ .name }}</a>
{{ end }}
```

**Result:**
- FR page → loads `data/config.json`
- EN page → loads `data/config.en.json`

## Data File Structure

For each localized data file, create:
- `data/{name}.json` - Default language (French)
- `data/{name}.en.json` - English translation
- `data/{name}.{lang}.json` - Additional languages

## Important Notes

⚠️ **Always use this partial instead of `.Site.Data.{name}` directly** when the data needs localization.

✅ **Automatic fallback**: If the localized file doesn't exist, the default language file is used.

✅ **No breaking changes**: If a localized file is missing, the site will still work with the default language.

## Migration Guide

### Before (incorrect):
```hugo
{{ .Site.Data.profile.personal.subtitle }}
{{ .Site.Data.config.blog.homeLimit }}
```

### After (correct):
```hugo
{{- $profile := partial "get-localized-data.html" (dict "context" . "dataName" "profile") -}}
{{ $profile.personal.subtitle }}

{{- $config := partial "get-localized-data.html" (dict "context" . "dataName" "config") -}}
{{ $config.blog.homeLimit }}
```
