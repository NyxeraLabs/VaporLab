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
	log.Printf("vaporlab starting on %s secure_mode=%v", addr, cfg.SecureMode)
	if err := http.ListenAndServe(addr, h); err != nil {
		log.Fatal(err)
	}
}
