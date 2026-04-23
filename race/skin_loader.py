import os
import pygame
from typing import Optional

# Теперь 4x масштаб для спрайтов
CAR_W = 54*4
CAR_H = 84*4

def get_skin(path: Optional[str] = None, color: tuple = (220, 40, 40)) -> pygame.Surface:
    if path and os.path.isfile(path):
        surf = pygame.image.load(path).convert_alpha()
        # Пропорциональное масштабирование
        w, h = surf.get_size()
        scale = min(CAR_W / w, CAR_H / h)
        new_size = (max(1, int(w * scale)), max(1, int(h * scale)))
        surf = pygame.transform.smoothscale(surf, new_size)
        
        canvas = pygame.Surface((CAR_W, CAR_H), pygame.SRCALPHA)
        canvas.blit(surf, ((CAR_W - new_size[0])//2, (CAR_H - new_size[1])//2))
        return canvas
    
    # Дефолтная машинка (если нет скина)
    surf = pygame.Surface((CAR_W, CAR_H), pygame.SRCALPHA)
    pygame.draw.rect(surf, color, (10, 10, CAR_W-20, CAR_H-20), border_radius=10)
    return surf

def list_numbered_asset_skins(assets_dir: str = "assets") -> list[str]:
    if not os.path.isdir(assets_dir): return []
    res = []
    for f in os.listdir(assets_dir):
        if f.split('.')[0].isdigit(): res.append(os.path.join(assets_dir, f))
    res.sort(key=lambda x: int(os.path.basename(x).split('.')[0]))
    return res