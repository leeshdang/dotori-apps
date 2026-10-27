!macro customRemoveFiles
  RMDir /r $INSTDIR
!macroend

!macro customUnInstallCheck
  ClearErrors
!macroend

!macro customInit
  ; Terminate any existing instance
  nsExec::Exec 'taskkill /f /im "${APP_EXECUTABLE_FILENAME}"'

  ; Remove old uninstall registry key so NSIS never invokes the bugged old-uninstaller
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}"
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\485d147b-8783-58d8-9e7e-baf25214aee2"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\485d147b-8783-58d8-9e7e-baf25214aee2"

  ; Clean out the old installation folder
  RMDir /r "$PROGRAMFILES64\Dotori Chess Learning"
!macroend

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
