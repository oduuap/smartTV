#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont
import math

# Create 512x512 icon
size = 512
icon = Image.new('RGB', (size, size), '#0a0e27')

draw = ImageDraw.Draw(icon)

# Draw decorative circles in background
center = size // 2
for i in range(3):
    radius = 240 - i * 30
    alpha_color = f'#{hex(20 + i * 15)[2:].zfill(2)}{hex(25 + i * 15)[2:].zfill(2)}{hex(50 + i * 20)[2:].zfill(2)}'
    draw.ellipse([center-radius, center-radius, center+radius, center+radius],
                 fill=alpha_color)

# Draw soccer ball in center - Yellow with gray border
ball_radius = 120
ball_center_x, ball_center_y = center, center

# Main ball circle - Yellow with gray border
draw.ellipse([ball_center_x-ball_radius, ball_center_y-ball_radius,
              ball_center_x+ball_radius, ball_center_y+ball_radius],
             fill='#FFD700', outline='#808080', width=8)

# Draw pentagon in center
pentagon_radius = 35
angles = [i * 72 - 90 for i in range(5)]
pentagon_points = []
for angle in angles:
    x = ball_center_x + pentagon_radius * math.cos(math.radians(angle))
    y = ball_center_y + pentagon_radius * math.sin(math.radians(angle))
    pentagon_points.append((x, y))

draw.polygon(pentagon_points, fill='#1a1a2e', outline='#1a1a2e')

# Draw hexagons around pentagon
hex_radius = 28
hex_distance = 60
hex_angles = [i * 72 - 90 for i in range(5)]

for hex_angle in hex_angles:
    hex_center_x = ball_center_x + hex_distance * math.cos(math.radians(hex_angle))
    hex_center_y = ball_center_y + hex_distance * math.sin(math.radians(hex_angle))

    hex_points = []
    for i in range(6):
        angle = i * 60 + 30
        x = hex_center_x + hex_radius * math.cos(math.radians(angle))
        y = hex_center_y + hex_radius * math.sin(math.radians(angle))
        hex_points.append((x, y))

    draw.polygon(hex_points, fill='#1a1a2e', outline='#1a1a2e')

# Add text "LSTV" at bottom with golden color
try:
    font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 72)
except:
    try:
        font = ImageFont.truetype("/System/Library/Fonts/SFNSDisplay.ttf", 72)
    except:
        font = ImageFont.load_default()

text = "LSTV"
bbox = draw.textbbox((0, 0), text, font=font)
text_width = bbox[2] - bbox[0]
text_x = (size - text_width) // 2
text_y = center + ball_radius + 40

# Draw text shadow for depth
shadow_offset = 3
draw.text((text_x + shadow_offset, text_y + shadow_offset), text, fill='#92400e', font=font)
# Draw main text in golden color
draw.text((text_x, text_y), text, fill='#fbbf24', font=font)

# Save main
icon.save('icon.png', 'PNG')
print(f"Created icon.png (512x512)")

# Create large icon (1024x1024)
large_icon = icon.resize((1024, 1024), Image.Resampling.LANCZOS)
large_icon.save('largeIcon.png', 'PNG')
print(f"Created largeIcon.png (1024x1024)")

print("✓ Icons created successfully with yellow soccer ball!")
