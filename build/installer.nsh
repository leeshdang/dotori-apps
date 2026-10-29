
!macro customInstall
  ; [Dotori] Save the installer-selected language so the app loads it on first launch
  StrCpy $R8 "ko"
  StrCmp $LANGUAGE "1033" 0 +2
  StrCpy $R8 "en"
  StrCmp $LANGUAGE "1041" 0 +2
  StrCpy $R8 "ja"
  StrCmp $LANGUAGE "2052" 0 +2
  StrCpy $R8 "zh"
  FileOpen $R7 "$INSTDIR\resources\dotori-lang.txt" w
  FileWrite $R7 "$R8"
  FileClose $R7
!macroend
