extends Node3D

const PlayerScript = preload("res://scripts/player.gd")
const AnimalScript = preload("res://scripts/animal.gd")
const QuizPanelScript = preload("res://scripts/quiz_panel.gd")
const MobileControlsScript = preload("res://scripts/mobile_controls.gd")
const SAVE_PATH := "user://pwnd_save.json"
var player: PwndPlayer
var animals: Array[PwndAnimal] = []
var energy := 180
var water := 80
var dock_built := false
var hud_energy: Label
var hud_water: Label
var message: Label
var interaction_hint: Label
var quiz_panel: PwndQuizPanel
var mobile_controls: PwndMobileControls
var save_hint: Label
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
	_build_ambient_audio()
	_build_player()
	_build_hud()
	_spawn_animals()
	_build_ripples()
	_load_game()
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
	water_surface = _add_box("water", Vector3(11, 0.12, 7), Vector3(0, 0.12, -1.3), Color("#4f9eaa"), 0.72)
	_add_box("bank", Vector3(5, 0.18, 10), Vector3(7.6, 0.05, 0), Color("#a9a06f"))
	for x in [-6.0, -4.8, 5.8, 7.0]:
		_add_reed(Vector3(x, 0, -2.8 + fmod(abs(x) * 1.7, 4.2)))
	for position in [Vector3(-3.0, 0.22, -1.0), Vector3(1.8, 0.22, -3.0), Vector3(3.2, 0.22, 0.0)]:
		_add_lily(position)
	_add_box("shore_stone", Vector3(1.1, 0.6, 0.8), Vector3(-6.5, 0.3, 2.7), Color("#768276"))
	_add_box("shore_stone", Vector3(0.8, 0.5, 0.7), Vector3(5.8, 0.25, 3.1), Color("#8c9280"))

func _build_ambient_audio() -> void:
	ambient_audio = AudioStreamPlayer.new()
	ambient_audio.name = "PondAmbient"
	ambient_audio.stream = load("res://audio/pond_ambient.wav")
	ambient_audio.volume_db = -15.0
	ambient_audio.finished.connect(ambient_audio.play)
	add_child(ambient_audio)
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
	player.position = Vector3(0, 0.65, 5.8)
	var collision := CollisionShape3D.new()
	var capsule := CapsuleShape3D.new()
	capsule.radius = 0.35
	capsule.height = 1.2
	collision.shape = capsule
	collision.position.y = 0.6
	player.add_child(collision)
	add_child(player)
	player.setup(self)

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
	var panel := ColorRect.new()
	panel.color = Color(0.04, 0.1, 0.09, 0.82)
	panel.position = Vector2(22, 20)
	panel.size = Vector2(370, 132)
	layer.add_child(panel)
	hud_energy = _label(layer, Vector2(42, 34), "ENERGIE  180", 22, Color("#f2c978"))
	hud_water = _label(layer, Vector2(42, 65), "WASSER   80", 22, Color("#8cd6e1"))
	_label(layer, Vector2(42, 98), "WASD bewegen · E bauen · F entwickeln", 12, Color("#c8d8c0"))
	_label(layer, Vector2(42, 116), "Q Quiz starten · Esc Maus lösen", 12, Color("#c8d8c0"))
	message = _label(layer, Vector2(34, 640), "", 18, Color("#f1edcf"))
	message.size = Vector2(900, 40)
	message.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	interaction_hint = _label(layer, Vector2(390, 548), "", 18, Color("#f2e6a4"))
	interaction_hint.size = Vector2(500, 42)
	interaction_hint.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	var crosshair := _label(layer, Vector2(637, 345), "+", 20, Color(0.95, 0.95, 0.82, 0.7))
	crosshair.size = Vector2(20, 20)
	save_hint = _label(layer, Vector2(1030, 28), "AUTOSAVE", 12, Color("#b9cbb5"))
	mobile_controls = MobileControlsScript.new()
	layer.add_child(mobile_controls)
	mobile_controls.move_changed.connect(player.set_mobile_move)
	mobile_controls.look_changed.connect(player.apply_touch_look)
	mobile_controls.action_pressed.connect(_on_mobile_action)
	quiz_panel = QuizPanelScript.new()
	layer.add_child(quiz_panel)
	quiz_panel.completed.connect(_on_quiz_completed)
	quiz_panel.closed.connect(_on_quiz_closed)

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
	quiz_panel.open_quiz()
	mobile_controls.hide()
	player.set_physics_process(false)
	Input.mouse_mode = Input.MOUSE_MODE_VISIBLE
	_update_hud("Quiz geöffnet. Wähle eine Antwort.")

func _on_mobile_action(action: String) -> void:
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

func _on_quiz_closed() -> void:
	player.set_physics_process(true)
	mobile_controls.show()
	if not DisplayServer.is_touchscreen_available():
		Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
	_update_hud("Zurück im Teichgarten.")

func _on_quiz_completed(correct: bool, _feedback: String) -> void:
	if correct:
		energy += 28
		water += 12
	else:
		energy += 8
	_update_hud("Quiz beendet. Die Belohnung wurde gespeichert.")
	_vibrate(70 if correct else 25)
	_save_game()

func _build_dock() -> void:
	if dock_built:
		_update_hud("Der Entensteg steht bereits.")
		return
	if energy < 60:
		_update_hud("Nicht genug Energie. Drücke Q für eine Quizrunde.")
		return
	energy -= 60
	dock_built = true
	_place_dock()
	_set_duck_dock_target()
	_update_hud("Entensteg gebaut. Die Ente hat jetzt einen eigenen Ort.")
	_vibrate(90)
	_save_game()

func _place_dock() -> void:
	_add_box("duck_dock", Vector3(2.2, 0.16, 0.8), Vector3(5.0, 0.48, -1.6), Color("#a4774e"))
	_add_box("duck_dock_post", Vector3(0.12, 0.8, 0.12), Vector3(4.2, 0.15, -1.6), Color("#76533d"))
	_add_box("duck_dock_post", Vector3(0.12, 0.8, 0.12), Vector3(5.8, 0.15, -1.6), Color("#76533d"))

func _set_duck_dock_target() -> void:
	for animal in animals:
		if animal.species == "duck":
			animal.set_dock_target(Vector3(5.0, 0.35, -1.6))

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
	if water < 20:
		_update_hud("Nicht genug Wasser. Drücke Q für eine Quizrunde.")
		return
	if nearest.development >= 2:
		_update_hud(nearest.species.capitalize() + " ist bereits vollständig entwickelt.")
		return
	water -= 20
	nearest.upgrade()
	_update_hud(nearest.species.capitalize() + " entwickelt sich mit Wasser weiter.")
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
		if nearest.development < 2:
			interaction_hint.text = "F / TIER: " + nearest.species.capitalize() + " mit Wasser entwickeln"
		else:
			interaction_hint.text = nearest.species.capitalize() + " · vollständig entwickelt"
	elif not dock_built and player.global_position.distance_to(Vector3(5.0, 0.5, -1.6)) < 3.0:
		interaction_hint.text = "E / BAUEN: Entensteg für 60 Energie"
	else:
		interaction_hint.text = ""

func _vibrate(duration_ms: int) -> void:
	if DisplayServer.is_touchscreen_available():
		Input.vibrate_handheld(duration_ms, 0.65)

func _save_game() -> void:
	var animal_data := {}
	for animal in animals:
		animal_data[animal.species] = animal.development
	var data := {"energy": energy, "water": water, "dock_built": dock_built, "animals": animal_data}
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
	var parsed = JSON.parse_string(file.get_as_text())
	file.close()
	if parsed is Dictionary:
		energy = int(parsed.get("energy", energy))
		water = int(parsed.get("water", water))
		dock_built = bool(parsed.get("dock_built", false))
		_loaded_animals = parsed.get("animals", {})

var _loaded_animals: Dictionary = {}

func _loaded_animal_development(species: String) -> int:
	return int(_loaded_animals.get(species, 0))

func _update_hud(status: String) -> void:
	if hud_energy:
		hud_energy.text = "ENERGIE  " + str(energy)
		hud_water.text = "WASSER   " + str(water)
	if message:
		message.text = status
