package config

import "os"

type Config struct {
	SecureMode        bool
	HardeningDisabled bool
	WeakJWTKey        string
	APIKey            string
}

func FromEnv() Config {
	return Config{
		SecureMode:        os.Getenv("SECURE_MODE") == "true",
		HardeningDisabled: getenv("HARDENING_ENABLED", "true") == "false",
		WeakJWTKey:        getenv("JWT_SECRET", "weaksecret"),
		APIKey:            getenv("AI_API_KEY", "hardcoded-demo-ai-key"),
	}
}

func getenv(k, fallback string) string {
	v := os.Getenv(k)
	if v == "" {
		return fallback
	}
	return v
}
