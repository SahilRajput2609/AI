@echo off
echo [AI-Company] Setting up project...

if not exist ".env" (
  copy .env.example .env
  echo [AI-Company] Created .env from .env.example
  echo [AI-Company] ^>^> Please edit .env and add your API keys
) else (
  echo [AI-Company] .env already exists, skipping
)

if not exist "data" (
  mkdir data
  echo [AI-Company] Created data/ directory
) else (
  echo [AI-Company] data/ directory already exists
)

echo [AI-Company] Setup complete.
