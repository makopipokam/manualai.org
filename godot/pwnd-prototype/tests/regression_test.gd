extends SceneTree

# Regressionstest für den pwnd-Godot-Prototypen.
#
# Ausführen:
#   godot --headless --path godot/pwnd-prototype --script res://tests/regression_test.gd
#
# Der Test endet mit Exit-Code 1, sobald eine Regel des Kernloops verletzt wird.
# Er deckt genau die Fehler ab, die Editor- und Runtime-Smoke-Tests nicht finden.

var failures: Array[String] = []

func _initialize() -> void:
	call_deferred("_run")

func _check(condition: bool, label: String, detail: String = "") -> void:
	if condition:
		print("  PASS  " + label)
	else:
		var message := label if detail.is_empty() else label + " — " + detail
		failures.append(message)
		print("  FAIL  " + message)

func _run() -> void:
	print("pwnd regression test")
	var main: Node3D = load("res://main.tscn").instantiate()
	root.add_child(main)
	await process_frame

	_test_quiz_progression(main)
	_test_quiz_answer_mapping(main)
	_test_habitat_requirement(main)
	await _test_touch_reset(main)
	_test_animal_stays_on_plane(main)
	_test_wading_matches_surface(main)
	_test_boot_height(main)
	_test_build_and_save_consistency(main)
	await _test_world_collisions(main)
	_test_safe_area_layout(main)
	await _test_quiz_layout(main)

	print("")
	if failures.is_empty():
		print("ALLE REGRESSIONSTESTS BESTANDEN")
		quit(0)
	else:
		print("FEHLGESCHLAGEN: %d" % failures.size())
		for failure in failures:
			print("  - " + failure)
		quit(1)

func _test_quiz_progression(main: Node3D) -> void:
	print("Quiz-Fortschritt")
	var quiz = main.quiz_panel
	quiz.question_index = 0
	quiz.open_quiz()
	var first_text: String = quiz.question_label.text
	_check(quiz.question_index == 0, "Quiz startet bei der aktuellen Frage", "index=%d" % quiz.question_index)
	quiz._next_question()
	_check(quiz.question_index == 1, "Weiter erhöht den Fragenindex", "index=%d" % quiz.question_index)
	_check(quiz.question_label.text != first_text, "Weiter zeigt eine andere Frage")
	quiz._next_question()
	quiz._next_question()
	_check(quiz.question_index == 0, "Fragen laufen zyklisch zurück", "index=%d" % quiz.question_index)
	quiz._answer(quiz.option_order.find(int(quiz.questions[0]["answer"])))
	quiz._close_quiz()
	quiz.open_quiz()
	_check(quiz.question_index == 1, "Erneutes Öffnen überspringt beantwortete Frage", "index=%d" % quiz.question_index)
	quiz._close_quiz()

func _test_quiz_answer_mapping(main: Node3D) -> void:
	print("Quiz-Antwortzuordnung")
	var quiz = main.quiz_panel
	var orders := {}
	var correct_found := false
	var wrong_found := false
	var reward_errors := 0
	for attempt in range(40):
		quiz.question_index = attempt % quiz.questions.size()
		quiz.open_quiz()
		orders[str(quiz.option_order)] = true
		var item: Dictionary = quiz.questions[quiz.question_index]
		var expected: int = int(item["answer"])
		for button_index in range(quiz.answer_buttons.size()):
			var shown_option: int = quiz.option_order[button_index]
			var shown_text: String = quiz.answer_buttons[button_index].text
			if shown_text != str(item["options"][shown_option]):
				failures.append("Angezeigter Text passt nicht zur Antwortzuordnung")
				break
		quiz.answered = false
		var picked: int = attempt % quiz.answer_buttons.size()
		var energy_before: int = main.energy
		var water_before: int = main.water
		quiz._answer(picked)
		if quiz.option_order[picked] == expected:
			correct_found = true
			if main.energy - energy_before != 28 or main.water - water_before != 12:
				reward_errors += 1
		else:
			wrong_found = true
			if main.energy - energy_before != 8 or main.water != water_before:
				reward_errors += 1
		var awarded_energy: int = main.energy
		quiz._answer(picked)
		if main.energy != awarded_energy:
			reward_errors += 1
		quiz._close_quiz()
	_check(orders.size() > 1, "Antwortreihenfolge wird gemischt", "varianten=%d" % orders.size())
	_check(correct_found and wrong_found, "Richtige und falsche Antworten sind erreichbar")
	_check(reward_errors == 0, "Belohnung ist korrekt und nur einmal pro Frage", "fehler=%d" % reward_errors)

func _test_habitat_requirement(main: Node3D) -> void:
	print("Habitat-Voraussetzung")
	var duck: PwndAnimal = null
	for animal in main.animals:
		if animal.required_structure() != "":
			duck = animal
	if duck == null:
		_check(false, "Ein Tier mit Habitat-Voraussetzung existiert")
		return
	main.dock_built = false
	duck.development = 0
	main.water = 999
	main.player.global_position = duck.global_position + Vector3(0.3, 0, 0.3)
	var water_before: int = main.water
	main._upgrade_nearest_animal()
	_check(duck.development == 0, "Ohne Habitat kein Upgrade", "stufe=%d" % duck.development)
	_check(main.water == water_before, "Ohne Habitat wird kein Wasser verbraucht", "verbraucht=%d" % (water_before - main.water))
	main.dock_built = true
	main._upgrade_nearest_animal()
	_check(duck.development == 1, "Mit Habitat ist das Upgrade erlaubt", "stufe=%d" % duck.development)

func _test_touch_reset(main: Node3D) -> void:
	print("Touch-Reset")
	var controls = main.mobile_controls
	controls.show()
	await process_frame
	var touch := InputEventScreenTouch.new()
	touch.pressed = true
	touch.index = 1
	touch.position = Vector2(80, controls.size.y - 110)
	controls._handle_touch(touch)
	var drag := InputEventScreenDrag.new()
	drag.index = 1
	drag.position = touch.position + Vector2(50, 0)
	drag.relative = Vector2(50, 0)
	controls._handle_drag(drag)
	_check(main.player.mobile_move.length() > 0.1, "Joystick bewegt den Spieler", "wert=%.2f" % main.player.mobile_move.length())
	controls.hide()
	await process_frame
	_check(main.player.mobile_move.length() < 0.001, "Verstecken stoppt die Bewegung", "wert=%.3f" % main.player.mobile_move.length())
	_check(controls.joystick_touch == -1 and controls.look_touch == -1, "Touch-Indizes sind zurückgesetzt")
	controls.show()
	await process_frame
	controls._handle_touch(touch)
	controls._handle_drag(drag)
	controls._notification(Node.NOTIFICATION_APPLICATION_FOCUS_OUT)
	_check(main.player.mobile_move.length() < 0.001, "Fokusverlust stoppt die Bewegung")

func _test_animal_stays_on_plane(main: Node3D) -> void:
	print("Tierbewegung")
	for animal in main.animals:
		var start_y: float = animal.global_position.y
		main.player.global_position = animal.global_position + Vector3(0.4, 0.5, 0.0)
		for step in range(20):
			animal._process(0.1)
		var drift: float = absf(animal.global_position.y - start_y)
		_check(drift < 0.001, "%s bleibt auf seiner Ebene" % animal.species, "abweichung=%.3f" % drift)

func _test_wading_matches_surface(main: Node3D) -> void:
	print("Sichtbares Wasser / Waten")
	var player: PwndPlayer = main.player
	_check(player.water_surface == main.water_surface, "Spieler benutzt die sichtbare Wasserfläche")
	for point in [Vector2(0, -4.6), Vector2(0, 2.0), Vector2(5.4, -1.3)]:
		player.global_position = Vector3(point.x, 0.65, point.y)
		_check(player.is_in_water(), "Im sichtbaren Wasser wird gewatet", "position=%s" % point)
	for point in [Vector2(0, 2.4), Vector2(5.7, -1.3), Vector2(0, 5.8)]:
		player.global_position = Vector3(point.x, 0.65, point.y)
		_check(not player.is_in_water(), "Außerhalb des Wassers kein Waten", "position=%s" % point)
	# Die leichte Wasseranimation rotiert die Fläche; die Abfrage muss mitrotieren.
	var bounds: AABB = main.water_surface.mesh.get_aabb()
	main.water_surface.rotation.y = 0.2
	var sample: Vector3 = main.water_surface.to_global(Vector3(bounds.end.x - 0.3, 0, bounds.end.z - 0.3))
	player.global_position = Vector3(sample.x, 0.65, sample.z)
	_check(player.is_in_water(), "Wassergrenze berücksichtigt die Mesh-Rotation")
	main.water_surface.rotation.y = 0.0

func _test_boot_height(main: Node3D) -> void:

	print("Gummistiefel-Höhe")
	var player: PwndPlayer = main.player
	player.global_position.y = 0.0
	var sole_world: Vector3 = player.camera.to_global(player.boot_nodes[0].position + Vector3(0, -0.18, -0.12))
	var water_y: float = main.water_surface.global_position.y
	_check(absf(sole_world.y - water_y) < 0.14, "Stiefelsohle liegt nahe der Wasseroberfläche", "sohle=%.2f wasser=%.2f" % [sole_world.y, water_y])
	_check(sole_world.y > -0.08, "Stiefelsohle bleibt über dem Boden", "sohle=%.2f" % sole_world.y)

func _test_world_collisions(main: Node3D) -> void:
	print("Weltkollision")
	var static_bodies: Array[Node] = []
	for child in main.get_children():
		if child is StaticBody3D:
			static_bodies.append(child)
	_check(static_bodies.size() >= 4, "Boden, Ufer und Steine haben Kollisionen", "körper=%d" % static_bodies.size())
	main.energy = 999
	main.dock_built = false
	main.player.global_position = Vector3(5.0, 0.0, 1.0)
	main._build_dock()
	var with_dock := 0
	for child in main.get_children():
		if child is StaticBody3D:
			with_dock += 1
	_check(with_dock >= 7, "Entensteg erhält Plattform- und Pfostenkollisionen", "körper=%d" % with_dock)
	main.player.rotation.y = PI / 2.0
	main.player.global_position = Vector3(-5.0, 0.0, 2.7)
	main.player.set_mobile_move(Vector2(0, -1))
	for _step in range(18):
		await physics_frame
	main.player.set_mobile_move(Vector2.ZERO)
	_check(main.player.global_position.x > -5.95, "Spieler wird vom Uferstein gestoppt", "x=%.2f" % main.player.global_position.x)
	main.player.rotation.y = 0.0

func _test_build_and_save_consistency(main: Node3D) -> void:
	print("Bau-Reichweite / Save-Validierung")
	main.dock_built = false
	main.energy = 180
	main.player.global_position = Vector3(-8.0, 0.0, 6.0)
	main._build_dock()
	_check(not main.dock_built, "Bau außerhalb der Reichweite wird verhindert")
	_check(main.energy == 180, "Bau außerhalb der Reichweite kostet keine Energie", "energie=%d" % main.energy)
	main.player.global_position = Vector3(5.0, 0.0, 1.0)
	main._build_dock()
	_check(main.dock_built, "Bau innerhalb der Reichweite ist erlaubt")
	_check(main.energy == 120, "Bau innerhalb der Reichweite zieht die Strukturkosten ab", "energie=%d" % main.energy)
	var safe: Dictionary = main._validated_save_data({
		"energy": -50,
		"water": 999999,
		"dock_built": "yes",
		"audio_enabled": "no",
		"animals": {"frog": 99, "duck": -4, "unknown": 99}
	})
	_check(safe["energy"] == 0 and safe["water"] == 9999, "Gespeicherte Ressourcen werden begrenzt", "energy=%s water=%s" % [safe["energy"], safe["water"]])
	_check(safe["dock_built"] == false and safe["audio_enabled"] == true, "Ungültige Save-Typen fallen auf sichere Werte zurück")
	_check(safe["animals"]["frog"] == 2 and safe["animals"]["duck"] == 0 and not safe["animals"].has("unknown"), "Tierstufen werden begrenzt und unbekannte Arten ignoriert")

func _test_safe_area_layout(main: Node3D) -> void:
	print("Safe-Area-HUD")
	main.get_viewport().size = Vector2i(720, 1280)
	main._layout_hud()
	var view_size: Vector2 = main.get_viewport().get_visible_rect().size
	var safe_rect: Rect2 = main._get_safe_view_rect(view_size)
	_check(safe_rect.position.x >= 0.0 and safe_rect.position.y >= 0.0, "Safe-Area beginnt innerhalb des Viewports")
	_check(safe_rect.end.x <= view_size.x + 0.1 and safe_rect.end.y <= view_size.y + 0.1, "Safe-Area endet innerhalb des Viewports")
	_check(main.hud_panel.position.x >= safe_rect.position.x, "HUD-Panel respektiert den linken Safe-Area-Rand")
	_check(main.save_hint.get_global_rect().end.x <= safe_rect.end.x + 1.0, "Autosave-Hinweis respektiert den rechten Safe-Area-Rand")
	var crosshair_center: Vector2 = main.crosshair.position + Vector2(10.0, 10.0)
	_check(safe_rect.has_point(crosshair_center), "Fadenkreuz bleibt im Safe-Area-Zentrum")

func _test_quiz_layout(main: Node3D) -> void:
	print("Quiz-Layout")
	var quiz = main.quiz_panel
	root.size = Vector2i(720, 1280)
	quiz.open_quiz()
	await process_frame
	var virtual_width: float = root.get_visible_rect().size.x
	var physical_height: float = quiz.answer_buttons[0].size.y * 720.0 / virtual_width
	_check(physical_height >= 44.0, "Portrait-Antwortfläche mindestens 44px", "höhe=%.1fpx" % physical_height)
	_check(quiz.answer_buttons[0].get_global_rect().end.x <= virtual_width, "Portrait-Antwortfläche bleibt im Viewport")
	quiz._answer(quiz.option_order.find(int(quiz.questions[quiz.question_index]["answer"])))
	await process_frame
	var next_height: float = quiz.next_button.size.y * 720.0 / virtual_width
	_check(next_height >= 44.0, "Portrait-Weiter-Fläche mindestens 44px", "höhe=%.1fpx" % next_height)
	quiz._close_quiz()
	root.size = Vector2i(1280, 720)
	quiz.open_quiz()
	await process_frame
	_check(quiz.answer_buttons[0].size.y >= 52.0, "Querformat behält bisherige Antwortflächen")
	quiz._close_quiz()
