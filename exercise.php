
<div id="MemOptions" class="sub_ctrl_bar">
	<span>
		<select id="idSelectSura" onchange="OC.changeSource(event)">
			<option selected value="0"><?=GetStr('random_verse')?></option>
		</select>
	</span>
	<span id="idByLevel">
		<span style="font-size:12px" NOWRAP id="LevelTitle">&nbsp;
				<?=GetStr('training_level')?>:
		</span>
		<select id="idSelectLevel" onchange="OC.changeLevel()">
			<option value="0"><?=GetStr('beginner')?></option>
			<option value="1"><?=GetStr('intermediate')?></option>
			<option value="2"><?=GetStr('good')?></option>
			<option value="3"><?=GetStr('advanced')?></option>
			<option value="4"><?=GetStr('excellent')?></option>
		</select>
	</span>
	<span id="AyaNumberOption" style="display:none;">
		<span><select id="PageList" onchange="OC.changePage(event)"><option value="0" selected><?=GetStr('select_page')?> ...</option>
		</select></span>
		<span style="white-space:nowrap"><?=GetStr('aya')?>: <input type="text" id="AyaNumber" value="1" style="width:30px"/></span> 
		<span style="white-space:nowrap"><input type="checkbox" id="Preview" checked onchange="OC.checkPreview()"/><span style="white-space:nowrap;"><?=GetStr('preview')?></span></span>
	</span>
</div>
<div id="ExercisePanel">
	<table style="width:100%">
	<tr>
		<td id="idAyaHeader" class="aya_title" >&nbsp;</td>
		<td id="ActionTitle" class="sub_title">&nbsp;</td>
	</tr>
	</table>

	<div id="TrainingViewer">
		<div id="idAyaDisplay" class="aya_view" style="padding:2px;border:solid 1px silver;display:none;">&nbsp;</div>
		<textarea id="idAnswer" class="aya_view" style="display:none;">&nbsp;</textarea>
	</div>

	<table>
	<tr>
		<td id="AnswerButtons" style="display:none;white-space:nowrap">
			<input type="button" class="actionBtn" value='<?=GetStr('ok')?>' onclick="OC.ok(event)">
			<input type="button" class="actionBtn" id="idGiveUp" value='<?=GetStr('cancel')?>' onclick='OC.cancel(event)'>
		</td>
		<td id="QuickStart" style="display:none;white-space:nowrap">
			<input type="button" id="QuickStartBtn" class="actionBtn" value='<?=GetStr('start_writing')?>' onclick='OC.quickStart(event)'>
			<input type="button" class="actionBtn" value='<?=GetStr('cancel')?>' onclick='OC.cancel(event)'>
		</td>
		<td>
			<input type="button" id="BtnNextAya" class="actionBtn" onclick="OC.nextAya(event)" value="<?=GetStr('next_verse') ?>" style="display:none"/>
			<input type="button" id="idAction" class="actionBtn" value="<?=GetStr('start')?>" onclick="OC.action(event)"/>
			<input type="button" id="BtnRandom" class="actionBtn" value="<?=GetStr('random_verse')?>" onclick="OC.random(event)"/>
		</td>
		<td id="Retry" style="display:none">
			<input class="actionBtn" id="RetryBtn" type="button" onclick="OC.retry(event)" value='<?=GetStr('retry')?>'>
		</td>
	</tr>
	</table>
</div>