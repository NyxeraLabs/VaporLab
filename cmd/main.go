package main

import (
	"log"
	"net/http"
	"os"

	"github.com/NyxeraLabs/VaporLab/pkg/config"
	"github.com/NyxeraLabs/VaporLab/pkg/lab"
)

func main() {
	cfg := config.FromEnv()
	h := lab.New(cfg)
	addr := ":8080"
	if p := os.Getenv("PORT"); p != "" {
		addr = ":" + p
	}
	log.Printf("vaporlab starting on %s secure_mode=%v hardening_enabled=%v", addr, cfg.SecureMode, !cfg.HardeningDisabled)
	if err := http.ListenAndServe(addr, h); err != nil {
		log.Fatal(err)
	}
}
