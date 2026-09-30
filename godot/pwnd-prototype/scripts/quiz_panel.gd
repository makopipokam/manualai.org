class_name PwndQuizPanel
extends Control

signal completed(correct: bool, prompt: String)

var questions: Array[Dictionary] = [
	{"question": "Welcher Faktor hilft einem Teich besonders, klares Wasser zu behalten?", "options": ["Ein ausgewogenes Pflanzenwachstum", "Nur Beton am Ufer", "Alle Tiere entfernen"], "answer": 0},
	{"question": "Was ist die beste Reaktion, wenn ein Frosch vor dir flieht?", "options": ["Langsam Abstand halten", "Hinterher sprinten", "Ins Wasser springen"], "answer": 0},
	{"question": "Wofür wird Wasser im pwnd-Prototyp eingesetzt?", "options": ["Für die Entwicklung von Tieren", "Für die Kamera", "Für das Menüdesign"], "answer": 0}
]
var question_index := 0
var question_label: Label
var feedback_label: Label
var answer_buttons: Array[Button] = []
var next_button: Button
var answered := false

func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_STOP
	_build_ui()
	hide()

func _build_ui() -> void:
	var shade := ColorRect.new()
	shade.color = Color(0.015, 0.04, 0.035, 0.88)
	shade.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(shade)
	var panel := PanelContainer.new()
	panel.custom_minimum_size = Vector2(680, 360)
	panel.set_anchors_preset(Control.PRESET_CENTER)
	panel.position -= Vector2(340, 180)
	panel.add_theme_stylebox_override("panel", _panel_style())
	add_child(panel)
	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 34)
	margin.add_theme_constant_override("margin_right", 34)
	margin.add_theme_constant_override("margin_top", 28)
	margin.add_theme_constant_override("margin_bottom", 28)
	panel.add_child(margin)
	var column := VBoxContainer.new()
	column.add_theme_constant_override("separation", 14)
	margin.add_child(column)
	var title := Label.new()
	title.text = "FREIES QUIZZEN"
	title.add_theme_font_size_override("font_size", 28)
	title.add_theme_color_override("font_color", Color("#f2c978"))
	column.add_child(title)
	question_label = Label.new()
	question_label.custom_minimum_size = Vector2(0, 68)
	question_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	question_label.add_theme_font_size_override("font_size", 20)
	question_label.add_theme_color_override("font_color", Color("#f1edcf"))
	column.add_child(question_label)
	for index in range(3):
		var button := Button.new()
		button.custom_minimum_size = Vector2(0, 42)
		button.add_theme_font_size_override("font_size", 16)
		button.pressed.connect(_answer.bind(index))
		column.add_child(button)
		answer_buttons.append(button)
	feedback_label = Label.new()
	feedback_label.custom_minimum_size = Vector2(0, 30)
	feedback_label.add_theme_font_size_override("font_size", 16)
	column.add_child(feedback_label)
	next_button = Button.new()
	next_button.text = "Nächste Frage"
	next_button.custom_minimum_size = Vector2(0, 42)
	next_button.add_theme_font_size_override("font_size", 16)
	next_button.pressed.connect(_next_question)
	next_button.hide()
	column.add_child(next_button)
	var hint := Label.new()
	hint.text = "Beantworte Fragen, um Energie und Wasser für deinen Teich zu gewinnen."
	hint.add_theme_font_size_override("font_size", 12)
	hint.add_theme_color_override("font_color", Color("#b9cbb5"))
	column.add_child(hint)

func _panel_style() -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = Color("#10251f")
	style.border_color = Color("#6b9c78")
	style.set_border_width_all(2)
	style.set_corner_radius_all(12)
	return style

func open_quiz() -> void:
	question_index = (question_index + 1) % questions.size()
	show()
	_render_question()

func _render_question() -> void:
	var item: Dictionary = questions[question_index]
	question_label.text = item["question"]
	var options: Array = item["options"]
	for index in range(answer_buttons.size()):
		answer_buttons[index].text = str(options[index])
		answer_buttons[index].disabled = false
		answer_buttons[index].modulate = Color.WHITE
	feedback_label.text = ""
	feedback_label.add_theme_color_override("font_color", Color("#f1edcf"))
	next_button.hide()
	answered = false

func _answer(index: int) -> void:
	if answered:
		return
	answered = true
	var item: Dictionary = questions[question_index]
	var correct := index == int(item["answer"])
	for button in answer_buttons:
		button.disabled = true
	if correct:
		feedback_label.text = "Richtig. Dein Teich profitiert: +28 Energie, +12 Wasser."
		feedback_label.add_theme_color_override("font_color", Color("#9bd18d"))
	else:
		feedback_label.text = "Noch nicht. Die richtige Antwort war: " + str(item["options"][int(item["answer"])])
		feedback_label.add_theme_color_override("font_color", Color("#e8a48e"))
	next_button.show()
	completed.emit(correct, feedback_label.text)

func _next_question() -> void:
	_render_question()
