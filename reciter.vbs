

function idPlayer_OnStateChange(oldState, newState)
	Select Case newState
	Case 0 ' stopped
		SetStatus newState, "التلاوة متوقفة, <a href='javascript:' onclick='idPlayer.DoPlay()'>اضغط هنا</a> أو على زر التشغيل للإستماع"
		Exit function
	Case 1 ' Contacting
		SetStatus newState, "الإتصال بسيرفر الصوت, فضلا الإنتظار.."
		Exit function
	Case 2 ' Buffering
	Case 3 ' Playing
	Case 4 ' Seeking
	End select
	
	SetStatus newState

End Function

function idPlayer_OnPositionChange(nPos, nLength)
	'on error resume next
	'window.opener.SyncPageView gSura, nPos, nLength
	gCurrPosition = nPos
	gCurrLength = nLength
	
	SetStatus 1, "جاري تلاوة السورة. (<a href='javascript:ResumeSound(gCurrPosition)'>إضغط هنا اذا انقطع الصوت</a>)&nbsp;(<a href='javascript:Backward10Secs()'>10 ثواني للخلف</a>)"

end function
