package engine

import "time"

type RuntimeInfo struct {
	StartedAt time.Time
	Mode      string
}

func NewRuntimeInfo(mode string) RuntimeInfo {
	return RuntimeInfo{StartedAt: time.Now().UTC(), Mode: mode}
}
