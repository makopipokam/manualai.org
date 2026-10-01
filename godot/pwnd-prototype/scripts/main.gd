extends Node3D

const PlayerScript = preload("res://scripts/player.gd")
const AnimalScript = preload("res://scripts/animal.gd")
const QuizPanelScript = preload("res://scripts/quiz_panel.gd")
const MobileControlsScript = preload("res://scripts/mobile_controls.gd")
const SAVE_PATH := "user://pwnd_save.json"
const ECONOMY_RULES := {
	"quiz_correct_energy": 28,
	"quiz_correct_water": 12,
	"quiz_wrong_energy": 8,
	"animal_upgrade_water": 20,
	"animal_max_stage": 2,
	"max_saved_resource": 9999
}
const ANIMAL_SPECIES := ["frog", "fish", "duck"]
const STRUCTURE_DEFINITIONS := {
	"duck_dock": {
		"energy_cost": 60,
		"build_range": 3.0,
		"platform_size": Vector3(2.2, 0.16, 0.8),
		"platform_position": Vector3(5.0, 0.48, -1.6),
		"platform_color": Color("#a4774e"),
		"post_size": Vector3(0.12, 0.8, 0.12),
		"post_positions": [Vector3(4.2, 0.15, -1.6), Vector3(5.8, 0.15, -1.6)],
		"post_color": Color("#76533d"),
		"target_position": Vector3(5.0, 0.35, -1.6)
	}
}
var player: PwndPlayer
var animals: Array[PwndAnimal] = []
var energy := 180
var water := 80
var dock_built := false
var audio_enabled := true
var hud_energy: Label
var hud_water: Label
var hud_panel: ColorRect
var control_hint_a: Label
var control_hint_b: Label
var message: Label
var interaction_hint: Label
var crosshair: Label
var quiz_panel: PwndQuizPanel
var mobile_controls: PwndMobileControls
var save_hint: Label
var pause_overlay: Control
var pause_panel: Panel
var pause_resume_button: Button
var performance_label: Label
var paused := false
var water_surface: MeshInstance3D
var lilies: Array[MeshInstance3D] = []
var reeds: Array[MeshInstance3D] = []
var ripples: Array[MeshInstance3D] = []
var ripple_materials: Array[StandardMaterial3D] = []
var ripple_times: Array[float] = []
var world_time := 0.0
var ambient_audio: AudioStreamPlayer

func _ready() -> void:
	_build_environment()
	_load_game()
	_build_ambient_audio()
	_build_player()
	_build_hud()
	_spawn_animals()
	_build_ripples()
	_update_hud("Willkommen in deinem kleinen Teich.")
	if dock_built:
		_place_dock()
		_set_duck_dock_target()
	for animal in animals:
		var saved_development: int = int(_loaded_animal_development(animal.species))
		for _step in range(saved_development):
			animal.upgrade()

func _build_environment() -> void:
	var world_env := WorldEnvironment.new()
	var environment := Environment.new()
	environment.background_mode = Environment.BG_COLOR
	environment.background_color = Color("#8bb6a0")
	environment.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	environment.ambient_light_color = Color("#d3e8c8")
	environment.ambient_light_energy = 0.75
	world_env.environment = environment
	add_child(world_env)
	var sun := DirectionalLight3D.new()
	sun.rotation_degrees = Vector3(-48, -28, 0)
	sun.light_color = Color("#fff0c4")
	sun.light_energy = 1.1
	sun.shadow_enabled = true
	add_child(sun)
	_add_box("ground", Vector3(24, 0.35, 18), Vector3(0, -0.25, 0), Color("#6b8f59"))
	_add_collision_box("ground_collision", Vector3(24, 0.35, 18), Vector3(0, -0.25, 0))
	water_surface = _add_box("water", Vector3(11, 0.12, 7), Vector3(0, 0.12, -1.3), Color("#4f9eaa"), 0.72)
	_add_box("bank", Vector3(5, 0.18, 10), Vector3(7.6, 0.05, 0), Color("#a9a06f"))
	_add_collision_box("bank_collision", Vector3(5, 0.18, 10), Vector3(7.6, 0.05, 0))
	for x in [-6.0, -4.8, 5.8, 7.0]:
		_add_reed(Vector3(x, 0, -2.8 + fmod(abs(x) * 1.7, 4.2)))
	for position in [Vector3(-3.0, 0.22, -1.0), Vector3(1.8, 0.22, -3.0), Vector3(3.2, 0.22, 0.0)]:
		_add_lily(position)
	_add_box("shore_stone", Vector3(1.1, 0.6, 0.8), Vector3(-6.5, 0.3, 2.7), Color("#768276"))
	_add_collision_box("shore_stone_collision", Vector3(1.1, 0.6, 0.8), Vector3(-6.5, 0.3, 2.7))
	_add_box("shore_stone", Vector3(0.8, 0.5, 0.7), Vector3(5.8, 0.25, 3.1), Color("#8c9280"))
	_add_collision_box("shore_stone_collision", Vector3(0.8, 0.5, 0.7), Vector3(5.8, 0.25, 3.1))

func _build_ambient_audio() -> void:
	ambient_audio = AudioStreamPlayer.new()
	ambient_audio.name = "PondAmbient"
	ambient_audio.stream = load("res://audio/pond_ambient.wav")
	ambient_audio.volume_db = -15.0
	ambient_audio.finished.connect(ambient_audio.play)
	add_child(ambient_audio)
	if audio_enabled:
		ambient_audio.play()

func _add_box(label_name: String, size: Vector3, position: Vector3, color: Color, transparency := 0.0) -> MeshInstance3D:
	var item := MeshInstance3D.new()
	item.name = label_name
	var mesh := BoxMesh.new()
	mesh.size = size
	item.mesh = mesh
	var material := StandardMaterial3D.new()
	material.albedo_color = color
	material.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA if transparency > 0 else BaseMaterial3D.TRANSPARENCY_DISABLED
	material.albedo_color.a = 1.0 - transparency
	material.roughness = 0.82
	item.material_override = material
	item.position = position
	add_child(item)
	return item

func _add_collision_box(label_name: String, size: Vector3, position: Vector3) -> StaticBody3D:
	var body := StaticBody3D.new()
	body.name = label_name
	var collision := CollisionShape3D.new()
	var shape := BoxShape3D.new()
	shape.size = size
	collision.shape = shape
	body.position = position
	body.add_child(collision)
	add_child(body)
	return body

func _add_reed(position: Vector3) -> void:
	for index in range(4):
		var reed := _add_box("reed", Vector3(0.08, 1.1 + index * 0.1, 0.08), position + Vector3(index * 0.14, 0.55, sin(index) * 0.16), Color("#48754d"))
		reed.rotation_degrees.z = -7 + index * 5
		reeds.append(reed)

func _add_lily(position: Vector3) -> void:
	var lily := MeshInstance3D.new()
	lily.name = "lily"
	var mesh := CylinderMesh.new()
	mesh.top_radius = 0.36
	mesh.bottom_radius = 0.36
	mesh.height = 0.035
	lily.mesh = mesh
	var material := StandardMaterial3D.new()
	material.albedo_color = Color("#80ba78")
	lily.material_override = material
	lily.position = position
	add_child(lily)
	lilies.append(lily)

func _build_player() -> void:
	player = PlayerScript.new()
	player.name = "Player"
	player.position = Vector3(0, 0.0, 5.8)
	var collision := CollisionShape3D.new()
	var capsule := CapsuleShape3D.new()
	capsule.radius = 0.35
	capsule.height = 1.2
	collision.shape = capsule
	collision.position.y = 0.6
	player.add_child(collision)
	add_child(player)
	player.setup(water_surface)

func _spawn_animals() -> void:
	_spawn_animal("frog", Vector3(-2.5, 0, -0.8))
	_spawn_animal("fish", Vector3(1.5, 0.16, -2.0))
	_spawn_animal("duck", Vector3(3.0, 0.35, -1.1))

func _spawn_animal(kind: String, position: Vector3) -> void:
	var animal: PwndAnimal = AnimalScript.new()
	animal.name = kind
	add_child(animal)
	animal.setup(kind, player, position)
	animals.append(animal)

func _build_hud() -> void:
	var layer := CanvasLayer.new()
	add_child(layer)
	hud_panel = ColorRect.new()
	hud_panel.color = Color(0.04, 0.1, 0.09, 0.82)
	layer.add_child(hud_panel)
	hud_energy = _label(layer, Vector2(42, 34), "ENERGIE  180", 22, Color("#f2c978"))
	hud_water = _label(layer, Vector2(42, 65), "WASSER   80", 22, Color("#8cd6e1"))
	control_hint_a = _label(layer, Vector2(42, 98), "WASD bewegen · E bauen · F entwickeln", 12, Color("#c8d8c0"))
	control_hint_b = _label(layer, Vector2(42, 116), "Q Quiz starten · Esc Maus lösen", 12, Color("#c8d8c0"))
	message = _label(layer, Vector2(34, 640), "", 18, Color("#f1edcf"))
	message.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	interaction_hint = _label(layer, Vector2(390, 548), "", 18, Color("#f2e6a4"))
	interaction_hint.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	crosshair = _label(layer, Vector2(637, 345), "+", 20, Color(0.95, 0.95, 0.82, 0.7))
	save_hint = _label(layer, Vector2(1030, 28), "AUTOSAVE", 12, Color("#b9cbb5"))
	mobile_controls = MobileControlsScript.new()
	layer.add_child(mobile_controls)
	mobile_controls.move_changed.connect(player.set_mobile_move)
	mobile_controls.look_changed.connect(player.apply_touch_look)
	mobile_controls.action_pressed.connect(_on_mobile_action)
	mobile_controls.set_audio_enabled(audio_enabled)
	_build_pause_overlay(layer)
	quiz_panel = QuizPanelScript.new()
	layer.add_child(quiz_panel)
	quiz_panel.completed.connect(_on_quiz_completed)
	quiz_panel.closed.connect(_on_quiz_closed)
	get_viewport().size_changed.connect(_layout_hud)
	get_viewport().size_changed.connect(_layout_pause_overlay)
	_layout_hud()
	_layout_pause_overlay()

func _layout_hud() -> void:
	if not hud_panel or not get_viewport():
		return
	var view_size: Vector2 = get_viewport().get_visible_rect().size
	var safe_rect: Rect2 = _get_safe_view_rect(view_size)
	var margin_left: float = maxf(16.0, safe_rect.position.x + 16.0)
	var margin_top: float = maxf(16.0, safe_rect.position.y + 16.0)
	var margin_right: float = maxf(16.0, view_size.x - safe_rect.end.x + 16.0)
	var panel_width: float = minf(370.0, maxf(240.0, safe_rect.size.x * 0.42))
	hud_panel.position = Vector2(margin_left, margin_top)
	hud_panel.size = Vector2(panel_width, 132)
	hud_energy.position = hud_panel.position + Vector2(20, 14)
	hud_water.position = hud_panel.position + Vector2(20, 45)
	control_hint_a.position = hud_panel.position + Vector2(20, 78)
	control_hint_b.position = hud_panel.position + Vector2(20, 96)
	if DisplayServer.is_touchscreen_available():
		control_hint_a.text = "Touch: bewegen · umsehen"
		control_hint_b.text = "Aktionen rechts · Pause oben"
	message.position = Vector2(margin_left, maxf(420.0, safe_rect.end.y - 76.0))
	message.size = Vector2(maxf(240.0, safe_rect.size.x - 32.0), 44)
	interaction_hint.position = Vector2(safe_rect.position.x + maxf(0.0, (safe_rect.size.x - 500.0) * 0.5), safe_rect.position.y + safe_rect.size.y * 0.70)
	interaction_hint.size = Vector2(minf(500.0, maxf(240.0, safe_rect.size.x - 32.0)), 42)
	var safe_center: Vector2 = safe_rect.position + safe_rect.size * 0.5
	crosshair.position = safe_center - Vector2(10.0, 10.0)
	save_hint.position = Vector2(maxf(margin_left, safe_rect.end.x - 150.0 - margin_right), margin_top)

func _get_safe_view_rect(view_size: Vector2) -> Rect2:
	var safe_area: Rect2i = DisplayServer.get_display_safe_area()
	var screen_size: Vector2i = DisplayServer.screen_get_size()
	if safe_area.size.x <= 0 or safe_area.size.y <= 0 or screen_size.x <= 0 or screen_size.y <= 0:
		return Rect2(Vector2.ZERO, view_size)
	var left_ratio: float = clampf(float(safe_area.position.x) / float(screen_size.x), 0.0, 1.0)
	var top_ratio: float = clampf(float(safe_area.position.y) / float(screen_size.y), 0.0, 1.0)
	var right_ratio: float = clampf(float(safe_area.end.x) / float(screen_size.x), left_ratio, 1.0)
	var bottom_ratio: float = clampf(float(safe_area.end.y) / float(screen_size.y), top_ratio, 1.0)
	return Rect2(Vector2(view_size.x * left_ratio, view_size.y * top_ratio), Vector2(view_size.x * (right_ratio - left_ratio), view_size.y * (bottom_ratio - top_ratio)))

func _build_pause_overlay(layer: CanvasLayer) -> void:
	pause_overlay = Control.new()
	pause_overlay.name = "PauseOverlay"
	pause_overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	pause_overlay.process_mode = Node.PROCESS_MODE_ALWAYS
	pause_overlay.mouse_filter = Control.MOUSE_FILTER_STOP
	pause_overlay.hide()
	layer.add_child(pause_overlay)
	var shade := ColorRect.new()
	shade.color = Color(0.015, 0.04, 0.035, 0.88)
	shade.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	pause_overlay.add_child(shade)
	pause_panel = Panel.new()
	pause_panel.set_anchors_preset(Control.PRESET_TOP_LEFT)
	pause_panel.add_theme_stylebox_override("panel", _pause_style())
	pause_overlay.add_child(pause_panel)
	var column := VBoxContainer.new()
	column.add_theme_constant_override("separation", 16)
	column.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	column.offset_left = 22.0
	column.offset_top = 18.0
	column.offset_right = -22.0
	column.offset_bottom = -18.0
	pause_panel.add_child(column)
	var title := Label.new()
	title.text = "TEICH PAUSIERT"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_font_size_override("font_size", 26)
	title.add_theme_color_override("font_color", Color("#f2c978"))
	column.add_child(title)
	var hint := Label.new()
	hint.text = "Bewegung, Audio und Touch-Eingaben sind angehalten."
	hint.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	hint.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	hint.add_theme_font_size_override("font_size", 16)
	hint.add_theme_color_override("font_color", Color("#f1edcf"))
	column.add_child(hint)
	performance_label = Label.new()
	performance_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	performance_label.add_theme_font_size_override("font_size", 13)
	performance_label.add_theme_color_override("font_color", Color("#a8c8b0"))
	column.add_child(performance_label)
	pause_resume_button = Button.new()
	pause_resume_button.text = "WEITER"
	pause_resume_button.custom_minimum_size = Vector2(0, 58)
	pause_resume_button.add_theme_font_size_override("font_size", 20)
	pause_resume_button.add_theme_stylebox_override("normal", _pause_style(Color("#d9c477"), Color("#10251f")))
	pause_resume_button.pressed.connect(_toggle_pause)
	column.add_child(pause_resume_button)
	_layout_pause_overlay()

func _layout_pause_overlay() -> void:
	if not pause_panel or not get_viewport():
		return
	var view_size: Vector2 = get_viewport().get_visible_rect().size
	var safe_rect: Rect2 = _get_safe_view_rect(view_size)
	var panel_size := Vector2(minf(560.0, maxf(280.0, safe_rect.size.x - 32.0)), minf(430.0, maxf(250.0, safe_rect.size.y - 32.0)))
	pause_panel.size = panel_size
	pause_panel.position = safe_rect.position + (safe_rect.size - panel_size) * 0.5

func _pause_style(background := Color("#10251f"), border := Color("#6b9c78")) -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = background
	style.border_color = border
	style.set_border_width_all(2)
	style.set_corner_radius_all(12)
	style.content_margin_left = 22
	style.content_margin_right = 22
	style.content_margin_top = 18
	style.content_margin_bottom = 18
	return style

func _label(parent: Node, position: Vector2, text: String, size: int, color: Color) -> Label:
	var label := Label.new()
	label.position = position
	label.text = text
	label.add_theme_font_size_override("font_size", size)
	label.add_theme_color_override("font_color", color)
	parent.add_child(label)
	return label

func _process(_delta: float) -> void:
	world_time += _delta
	_animate_environment()
	_animate_ripples(_delta)
	_update_interaction_hint()
	if dock_built:
		_set_duck_dock_target()
	if Input.is_action_just_pressed("quiz_reward") and quiz_panel and not quiz_panel.visible:
		_open_quiz()
	if Input.is_action_just_pressed("interact") and not quiz_panel.visible:
		_build_dock()
	if Input.is_action_just_pressed("feed") and not quiz_panel.visible:
		_upgrade_nearest_animal()

func _open_quiz() -> void:
	quiz_panel.set_reward_text("Richtig. Dein Teich profitiert: +%d Energie, +%d Wasser." % [
		int(ECONOMY_RULES["quiz_correct_energy"]),
		int(ECONOMY_RULES["quiz_correct_water"])
	])
	quiz_panel.open_quiz()
	mobile_controls.hide()
	player.set_physics_process(false)
	Input.mouse_mode = Input.MOUSE_MODE_VISIBLE
	_update_hud("Quiz geöffnet. Wähle eine Antwort.")

func _on_mobile_action(action: String) -> void:
	if action == "pause":
		_toggle_pause()
		return
	if action == "sound":
		_toggle_audio()
		return
	if quiz_panel.visible:
		return
	_vibrate(35)
	match action:
		"quiz":
			_open_quiz()
		"build":
			_build_dock()
		"develop":
			_upgrade_nearest_animal()

func _toggle_pause() -> void:
	paused = not paused
	get_tree().paused = paused
	if paused:
		player.set_physics_process(false)
		mobile_controls.hide()
		_update_performance_label()
		pause_overlay.show()
	else:
		player.set_physics_process(true)
		pause_overlay.hide()
		mobile_controls.show()
		_update_hud("Zurück im Teichgarten.")

func _update_performance_label() -> void:
	if not performance_label:
		return
	var fps: int = Engine.get_frames_per_second()
	var object_count: int = int(Performance.get_monitor(Performance.OBJECT_COUNT))
	var viewport_size: Vector2 = get_viewport().get_visible_rect().size
	var orientation: String = "Portrait" if viewport_size.y > viewport_size.x else "Landscape"
	var input_mode: String = "Touch" if DisplayServer.is_touchscreen_available() else "Mouse/Keyboard"
	performance_label.text = "Diagnose · FPS %d · Objekte %d\n%s · %d×%d · %s" % [fps, object_count, orientation, int(viewport_size.x), int(viewport_size.y), input_mode]

func _toggle_audio() -> void:
	audio_enabled = not audio_enabled
	if ambient_audio:
		if audio_enabled:
			ambient_audio.play()
		else:
			ambient_audio.stop()
	if mobile_controls:
		mobile_controls.set_audio_enabled(audio_enabled)
	_update_hud("Teichklang eingeschaltet." if audio_enabled else "Teichklang ausgeschaltet.")
	_vibrate(20)
	_save_game()

func _on_quiz_closed() -> void:
	player.set_physics_process(true)
	mobile_controls.show()
	if not DisplayServer.is_touchscreen_available():
		Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
	_update_hud("Zurück im Teichgarten.")

func _on_quiz_completed(correct: bool, _feedback: String) -> void:
	var gained_energy := 0
	var gained_water := 0
	if correct:
		gained_energy = int(ECONOMY_RULES["quiz_correct_energy"])
		gained_water = int(ECONOMY_RULES["quiz_correct_water"])
	else:
		gained_energy = int(ECONOMY_RULES["quiz_wrong_energy"])
	energy += gained_energy
	water += gained_water
	if gained_water > 0:
		_update_hud("Quiz beendet. +%d Energie und +%d Wasser gespeichert." % [gained_energy, gained_water])
	else:
		_update_hud("Quiz beendet. +%d Energie gespeichert." % gained_energy)
	_vibrate(70 if correct else 25)
	_save_game()

func _build_dock() -> void:
	var definition: Dictionary = STRUCTURE_DEFINITIONS["duck_dock"]
	var energy_cost: int = int(definition["energy_cost"])
	if dock_built:
		_update_hud("Der Entensteg steht bereits.")
		return
	if _distance_to_structure("duck_dock") > float(definition["build_range"]):
		_update_hud("Geh näher an die Uferstelle, um den Entensteg zu bauen.")
		return
	if energy < energy_cost:
		_update_hud("Nicht genug Energie. Drücke Q für eine Quizrunde.")
		return
	energy -= energy_cost
	dock_built = true
	_place_dock()
	_set_duck_dock_target()
	_update_hud("Entensteg gebaut. Die Ente hat jetzt einen eigenen Ort.")
	_vibrate(90)
	_save_game()

func _place_dock() -> void:
	var definition: Dictionary = STRUCTURE_DEFINITIONS["duck_dock"]
	var platform_size: Vector3 = definition["platform_size"]
	var platform_position: Vector3 = definition["platform_position"]
	var platform_color: Color = definition["platform_color"]
	_add_box("duck_dock", platform_size, platform_position, platform_color)
	_add_collision_box("duck_dock_collision", platform_size, platform_position)
	var post_size: Vector3 = definition["post_size"]
	var post_color: Color = definition["post_color"]
	for post_data in definition["post_positions"]:
		var post_position: Vector3 = post_data
		_add_box("duck_dock_post", post_size, post_position, post_color)
		_add_collision_box("duck_dock_post_collision", post_size, post_position)

func _set_duck_dock_target() -> void:
	var target_position: Vector3 = STRUCTURE_DEFINITIONS["duck_dock"]["target_position"]
	for animal in animals:
		if animal.species == "duck":
			animal.set_dock_target(target_position)

func _animate_environment() -> void:
	if water_surface:
		water_surface.position.y = 0.12 + sin(world_time * 1.4) * 0.018
		water_surface.rotation.y = sin(world_time * 0.16) * 0.006
	for index in range(lilies.size()):
		var lily := lilies[index]
		lily.position.y = 0.22 + sin(world_time * 1.2 + index) * 0.018
		lily.rotation.y = sin(world_time * 0.6 + index) * 0.12
	for index in range(reeds.size()):
		var reed := reeds[index]
		reed.rotation.z = deg_to_rad(sin(world_time * 0.8 + index * 0.35) * 5.0)

func _build_ripples() -> void:
	_add_ripple()
	_add_ripple()

func _add_ripple() -> void:
	var ripple := MeshInstance3D.new()
	var mesh := TorusMesh.new()
	mesh.inner_radius = 0.28
	mesh.outer_radius = 0.34
	mesh.rings = 16
	mesh.ring_segments = 24
	ripple.mesh = mesh
	var material := StandardMaterial3D.new()
	material.albedo_color = Color(0.64, 0.9, 0.92, 0.35)
	material.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	ripple.material_override = material
	ripple.position.y = 0.25
	add_child(ripple)
	ripples.append(ripple)
	ripple_materials.append(material)
	ripple_times.append(randf_range(0.0, 1.4))

func _animate_ripples(delta: float) -> void:
	if ripples.size() < 2 or animals.size() < 2:
		return
	var fish: PwndAnimal = animals[1]
	for index in range(ripples.size()):
		ripple_times[index] = fmod(ripple_times[index] + delta, 1.4)
		var pulse := ripple_times[index] / 1.4
		var ripple := ripples[index]
		if index == 0:
			ripple.position = Vector3(player.global_position.x, 0.25, player.global_position.z)
		else:
			ripple.position = Vector3(fish.global_position.x, 0.25, fish.global_position.z)
		ripple.scale = Vector3.ONE * (0.65 + pulse * 1.45)
		var visible := index == 1 or player.is_in_water()
		var color := ripple_materials[index].albedo_color
		color.a = (1.0 - pulse) * 0.42 if visible else 0.0
		ripple_materials[index].albedo_color = color

func _upgrade_nearest_animal() -> void:
	if animals.is_empty():
		return
	var nearest: PwndAnimal = animals[0]
	var nearest_distance := player.global_position.distance_to(nearest.global_position)
	for animal in animals:
		var distance := player.global_position.distance_to(animal.global_position)
		if distance < nearest_distance:
			nearest = animal
			nearest_distance = distance
	if nearest_distance > 3.2:
		_update_hud("Geh näher an ein Tier heran, um es mit Wasser zu entwickeln.")
		return
	var water_cost: int = int(ECONOMY_RULES["animal_upgrade_water"])
	var max_stage: int = int(ECONOMY_RULES["animal_max_stage"])
	var required_structure: String = nearest.required_structure()
	if required_structure == "duck_dock" and not dock_built:
		_update_hud("%s braucht zuerst den Entensteg. Baue ihn mit E / BAUEN." % nearest.species.capitalize())
		return
	if water < water_cost:
		_update_hud("Nicht genug Wasser. Drücke Q für eine Quizrunde.")
		return
	if nearest.development >= max_stage:
		_update_hud(nearest.species.capitalize() + " ist bereits vollständig entwickelt.")
		return
	water -= water_cost
	nearest.upgrade()
	_update_hud("%s entwickelt sich weiter. −%d Wasser." % [nearest.species.capitalize(), water_cost])
	_vibrate(80)
	_save_game()

func _update_interaction_hint() -> void:
	if not interaction_hint or quiz_panel.visible:
		return
	var nearest: PwndAnimal
	var nearest_distance := INF
	for animal in animals:
		var distance := player.global_position.distance_to(animal.global_position)
		if distance < nearest_distance:
			nearest = animal
			nearest_distance = distance
	if nearest and nearest_distance <= 3.2:
		var required_structure: String = nearest.required_structure()
		if required_structure == "duck_dock" and not dock_built:
			interaction_hint.text = "HABITAT: Entensteg für die Ente bauen"
		elif nearest.development < 2:
			interaction_hint.text = "F / TIER: " + nearest.species.capitalize() + " mit Wasser entwickeln"
		else:
			interaction_hint.text = nearest.species.capitalize() + " · vollständig entwickelt"
	elif not dock_built and _distance_to_structure("duck_dock") <= float(STRUCTURE_DEFINITIONS["duck_dock"]["build_range"]):
		interaction_hint.text = "E / BAUEN: Entensteg für %d Energie" % int(STRUCTURE_DEFINITIONS["duck_dock"]["energy_cost"])
	else:
		interaction_hint.text = ""

func _distance_to_structure(structure_id: String) -> float:
	var target: Vector3 = STRUCTURE_DEFINITIONS[structure_id]["platform_position"]
	var player_plane := Vector3(player.global_position.x, target.y, player.global_position.z)
	return player_plane.distance_to(target)

func _vibrate(duration_ms: int) -> void:
	if DisplayServer.is_touchscreen_available():
		Input.vibrate_handheld(duration_ms, 0.65)

func _save_game() -> void:
	var animal_data := {}
	for animal in animals:
		animal_data[animal.species] = animal.development
	var data := {"energy": energy, "water": water, "dock_built": dock_built, "audio_enabled": audio_enabled, "animals": animal_data}
	var file := FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	if file:
		file.store_string(JSON.stringify(data))
		file.close()
		if save_hint:
			save_hint.text = "AUTOSAVE · gespeichert"

func _load_game() -> void:
	if not FileAccess.file_exists(SAVE_PATH):
		return
	var file := FileAccess.open(SAVE_PATH, FileAccess.READ)
	if not file:
		return
	var parsed: Variant = JSON.parse_string(file.get_as_text())
	file.close()
	var safe_data: Dictionary = _validated_save_data(parsed)
	energy = int(safe_data["energy"])
	water = int(safe_data["water"])
	dock_built = bool(safe_data["dock_built"])
	audio_enabled = bool(safe_data["audio_enabled"])
	_loaded_animals = safe_data["animals"]

func _validated_save_data(parsed: Variant) -> Dictionary:
	var safe := {
		"energy": energy,
		"water": water,
		"dock_built": false,
		"audio_enabled": true,
		"animals": {}
	}
	if not parsed is Dictionary:
		return safe
	var data: Dictionary = parsed
	var max_resource: int = int(ECONOMY_RULES["max_saved_resource"])
	safe["energy"] = clampi(_safe_int(data.get("energy", energy), energy), 0, max_resource)
	safe["water"] = clampi(_safe_int(data.get("water", water), water), 0, max_resource)
	var dock_value: Variant = data.get("dock_built", false)
	var audio_value: Variant = data.get("audio_enabled", true)
	safe["dock_built"] = dock_value if dock_value is bool else false
	safe["audio_enabled"] = audio_value if audio_value is bool else true
	var saved_animals: Variant = data.get("animals", {})
	if saved_animals is Dictionary:
		var animal_data: Dictionary = {}
		for species in ANIMAL_SPECIES:
			animal_data[species] = clampi(_safe_int(saved_animals.get(species, 0), 0), 0, int(ECONOMY_RULES["animal_max_stage"]))
		safe["animals"] = animal_data
	return safe

func _safe_int(value: Variant, fallback: int) -> int:
	if value is bool or not (value is int or value is float):
		return fallback
	return int(value)

var _loaded_animals: Dictionary = {}

func _loaded_animal_development(species: String) -> int:
	return int(_loaded_animals.get(species, 0))

func _update_hud(status: String) -> void:
	if hud_energy:
		hud_energy.text = "ENERGIE  " + str(energy)
		hud_water.text = "WASSER   " + str(water)
	if message:
		message.text = status
