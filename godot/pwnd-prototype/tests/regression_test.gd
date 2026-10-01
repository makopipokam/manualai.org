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
