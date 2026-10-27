# Tipologie di Slide e Disposizione dei Contenuti

Guida di riferimento e specifica per la redazione delle slide dei percorsi formativi di `corso-ia-docenti`.
Ogni tipologia definisce un modello dati dichiarativo a proprieta tipizzate, la disposizione automatica del layout e la coreografia degli effetti visivi per una resa ottimale in aula.

---

## 1. COPERTINA
- **Finalita didattica**: Slide di apertura della lezione. Cattura l'attenzione iniziale e inquadra il modulo didattico con i relativi metadati temporali e formali.
- **Struttura dati (Campi JSON)**:
  - `titolo`: string (Titolo principale della lezione)
  - `sottotitolo`: string (Sintesi o obiettivo generale della lezione)
  - `badge`: string (Etichetta del percorso o ente formativo)
  - `metadati`: array di oggetti `{ label: string, valore: string }` (Durata, Modulo, Data)
- **Disposizione e Layout**: Layout a impatto pieno con tipografia centrale prominente, badge superiore ed elegante griglia orizzontale di riepilogo metadati nel terzo inferiore.
- **Effetti visivi**: Animazione di ingresso a espansione tipografica graduale e comparsa scaglionata dei blocchi metadati.

---

## 2. INDICE
- **Finalita didattica**: Panoramica e scaletta strutturata dei temi trattati durante la sessione formativa.
- **Struttura dati (Campi JSON)**:
  - `titolo`: string (Titolo dell'indice o roadmap)
  - `lead`: string opzionale (Introduzione al percorso odierno)
  - `voci`: array di stringhe o oggetti `{ numero?: number, testo: string, descrizione?: string }`
  - `badge`: string opzionale
- **Disposizione e Layout**: Elenco ordinato a due colonne o lista a schede numerate con connettore verticale di avanzamento, che rende immediatamente chiara la scansione temporale.
- **Effetti visivi**: Comparsa scaglionata a cascata delle voci dell'indice (ritardo progressivo di 40ms) con leggera evidenziazione al passaggio del mouse.

---

## 3. SEZIONE
- **Finalita didattica**: Slide di transizione e raccordo tra macro-argomenti. Segnala un cambio di ritmo o l'inizio di una nuova unita concettuale.
- **Struttura dati (Campi JSON)**:
  - `titolo`: string (Titolo della nuova sezione)
  - `numeroSezione`: string o number (Numero progressivo corrispondente all'indice)
  - `descrizione`: string (Sintesi degli obiettivi e dei contenuti della sezione)
  - `badge`: string opzionale
- **Disposizione e Layout**: Layout a impatto pieno con grande numero identificativo della sezione in trasparenza o badge scultoreo, titolo a caratteri grandi e indicatore di raccordo con l'agenda.
- **Effetti visivi**: Transizione morbida con ingrandimento impercettibile del numero di sezione e comparsa fluida del testo descrittivo.

---

## 4. CONTENUTO
- **Finalita didattica**: Esposizione ordinaria di concetti, definizioni, inquadramenti teorici o contesti operativi.
- **Struttura dati (Campi JSON)**:
  - `titolo`: string
  - `lead`: string opzionale (Frase guida introduttiva in risalto)
  - `paragrafi`: array di stringhe (Testi esplicativi)
  - `puntiChiave`: array di stringhe opzionale (Punti elenco con evidenziazione grafica)
  - `badge`: string opzionale
- **Disposizione e Layout**: Disposizione lineare a lettura agevole con paragrafo guida in grande evidenza (lead paragraph) seguito da blocchi di lettura distanziati o elenco a punti con indicatori visivi stilizzati.
- **Effetti visivi**: Dissolvenza dal basso dei paragrafi e comparsa ordinata dei punti chiave.

---

## 5. GRIGLIA
- **Finalita didattica**: Presentazione modulare di concetti paralleli, tassonomie, pilastri metodologici, prospettive complementari (es. formatore vs classe) o confronti diretti tra due o piu approcci. Il numero di schede si adatta fluidamente alla complessita del contenuto.
- **Struttura dati (Campi JSON)**:
  - `titolo`: string
  - `lead`: string opzionale
  - `schede`: array di oggetti `{ titolo: string, testo?: string, punti?: string[], evidenza?: string, icona?: string }`
  - `badge`: string opzionale
- **Disposizione e Layout**: Griglia responsive automatica (2, 3 o piu colonne in base al numero di schede) ad altezza uniforme, con schede a sfondo differenziato, bordo di delimitazione, supporto a elenchi puntati interni e tipografia gerarchica. Quando vi sono due sole schede, queste si espandono simmetricamente a tutta larghezza.
- **Effetti visivi**: Entrata scaglionata a cascata (*staggered entrance*) delle schede e micro-elevazione con riflesso morbido all'hover.

---

## 6. BIVIO
- **Finalita didattica**: Esplorazione interattiva di due opzioni operative alternative tra cui scegliere e alternare la visualizzazione in tempo reale durante la lezione.
- **Struttura dati (Campi JSON)**:
  - `titolo`: string
  - `lead`: string opzionale
  - `opzioneA`: oggetto `{ etichetta: string, sottotitolo?: string, testo: string, esito?: string }`
  - `opzioneB`: oggetto `{ etichetta: string, sottotitolo?: string, testo: string, esito?: string }`
  - `badge`: string opzionale
- **Disposizione e Layout**: Barra di commutazione superiore con pulsanti interattivi e pannello centrale con card attiva in risalto e card inattiva in secondo piano con opacita calibrata.
- **Effetti visivi**: Transizione fluida con morphing e scorrimento laterale al cambio di selezione, con indicatore di stato dinamico.

---

## 7. SEQUENZA
- **Finalita didattica**: Guida passo-passo attraverso un processo multi-fase o un ciclo operativo (es. Ciclo di audit o catena del prompt).
- **Struttura dati (Campi JSON)**:
  - `titolo`: string
  - `lead`: string opzionale
  - `step`: array di oggetti `{ numero: number, fase: string, descrizione: string, ruolo?: string }`
  - `badge`: string opzionale
- **Disposizione e Layout**: Card centrale focalizzata sullo step attivo, con indicatore di progresso a pallini interattivi, pillola del ruolo coinvolto e pulsanti di navigazione precedente/successivo.
- **Effetti visivi**: Scorrimento orizzontale della scheda al cambio di fase e animazione di espansione dell'indicatore a pallino attivo.

---

## 8. TABELLA
- **Finalita didattica**: Rappresentazione sintetica di dati strutturati, comparazioni multidimensionali, schemi normativi o parametri tecnici.
- **Struttura dati (Campi JSON)**:
  - `titolo`: string
  - `lead`: string opzionale
  - `colonne`: array di stringhe (Intestazioni di colonna)
  - `righe`: array di array di stringhe `string[][]` (Celle dei dati)
  - `badge`: string opzionale
- **Disposizione e Layout**: Tabella a larghezza piena con contenitore a scorrimento orizzontale su schermi compatti, intestazioni con sfondo dedicato e righe alternate per la massima leggibilita.
- **Effetti visivi**: Evidenziazione delicata della riga attiva al passaggio del cursore e dissolvenza d'ingresso graduale della matrice.

---

## 9. LISTA_SPUNTA
- **Finalita didattica**: Verifica operativa, protocolli d'aula o checklist di controllo metodologico con tracciamento interattivo dello stato di completamento.
- **Struttura dati (Campi JSON)**:
  - `titolo`: string
  - `lead`: string opzionale
  - `elementi`: array di oggetti `{ id: string | number, testo: string }`
  - `badge`: string opzionale
- **Disposizione e Layout**: Barra superiore di avanzamento con percentuale e conteggio elementi completati, seguita da elementi di spunta verticali ampi e facilmente cliccabili anche su touchscreen.
- **Effetti visivi**: Animazione di riempimento progressivo della barra di avanzamento e micro-rimbalzo (scale-bounce) dell'icona di spunta al click.

---

## 10. FIGURA
- **Finalita didattica**: Esposizione di immagini fotografiche, diagrammi vettoriali SVG, schemi concettuali o canvas operativi con dettagliata contestualizzazione.
- **Struttura dati (Campi JSON)**:
  - `titolo`: string
  - `lead`: string opzionale
  - `media`: oggetto `{ sorgente: string, tipoMedia?: "immagine" | "svg", didascalia?: string, alt?: string }`
  - `commento`: string o array di stringhe opzionale (Note di decostruzione critica)
  - `badge`: string opzionale
- **Disposizione e Layout**: Layout combinato con contenitore dell'immagine a cornice calibrata affiancato o sormontato da didascalia e blocco analitico per l'interpretazione critica.
- **Effetti visivi**: Ingresso con dissolvenza graduale del media e lieve zoom-in controllato al caricamento.

---

## 11. ANIMAZIONE
- **Finalita didattica**: Dimostrazione dinamica, flusso di dati temporale o simulazione interattiva di un algoritmo o di un fenomeno di IA.
- **Struttura dati (Campi JSON)**:
  - `titolo`: string
  - `lead`: string opzionale
  - `sorgenteAnimazione`: string (URL video, Lottie, SVG animato o canvas)
  - `spiegazioneFasi`: array di stringhe (Guida alla lettura del movimento)
  - `badge`: string opzionale
- **Disposizione e Layout**: Area visiva centrale a grande formato con controlli di riproduzione/pausa integrati e barra laterale o inferiore di annotazioni didattiche.
- **Effetti visivi**: Cornice luminosa attiva durante la riproduzione con transizioni temporizzate sincrone con le fasi esplicative.

---

## 12. LABORATORIO
- **Finalita didattica**: Esercitazione pratica guidata, prompt design in aula o attivita di gruppo per docenti.
- **Struttura dati (Campi JSON)**:
  - `titolo`: string
  - `lead`: string opzionale
  - `obiettivo`: string (Scopo operativo dell'attivita)
  - `contesto`: string opzionale (Scenario didattico di riferimento)
  - `passi`: array di stringhe (Azioni operative ordinate da compiere)
  - `promptEsempio`: string opzionale (Testo del prompt da testare o adattare)
  - `badge`: string opzionale
- **Disposizione e Layout**: Scheda Laboratorio Integrata perfettamente armonizzata con lo stile della slide principale. Include le Azioni Documento Laboratorio in alto a destra con icone SVG coerenti con il Dock: commutazione in-place dell'anteprima formattata e icone dedicate di copia rapida negli appunti per template Markdown ed eventuale esempio didattico.
- **Effetti visivi**: Bordi e superfici conformi alle variabili CSS del tema (massimo contrasto in Dark, Light e High-Contrast), feedback visivo temporaneo di avvenuta copia con tooltip contestuale.

---

## 13. VERIFICA
- **Finalita didattica**: Domanda formativa a risposta multipla per consolidare l'apprendimento e avviare la discussione in aula prima di proseguire.
- **Struttura dati (Campi JSON)**:
  - `titolo`: string
  - `domanda`: string
  - `opzioni`: array di oggetti `{ id: string, testo: string, corretta: boolean }`
  - `spiegazione`: string (Commento didattico di rinforzo visualizzato dopo la risposta)
  - `badge`: string opzionale
- **Disposizione e Layout**: Riquadro superiore per il quesito, griglia di selezione delle opzioni con grandi pulsanti di risposta, e pannello inferiore di feedback visivo (verde/rosso) con spiegazione e pulsante di riprova.
- **Effetti visivi**: Transizione cromatica fluida alla selezione, animazione a pulsazione morbida sulla risposta esatta e comparsa con scorrimento del feedback didattico.

---

## 14. ENUNCIATO
- **Finalita didattica**: Fissare una regola aurea, un principio etico o una tesi forte che deve rimanere impressa nella mente dei corsisti.
- **Struttura dati (Campi JSON)**:
  - `titolo`: string
  - `affermazione`: string (Testo principale dell'enunciato in grande corpo)
  - `nota`: string opzionale (Chiarimento o implicazione didattica)
  - `badge`: string opzionale
- **Disposizione e Layout**: Contenitore monumentale con testo in grande corpo racchiuso tra virgolette stilizzate, centrato verticalmente nello spazio della slide.
- **Effetti visivi**: Dissolvenza dal fondo con lieve sfocatura iniziale verso la nitidezza (*defocus to focus*) e alone luminoso soffuso.

---

## 15. ATTENZIONE
- **Finalita didattica**: Segnalazione di rischi, cautele metodologiche, criticita normative (es. privacy o copyright), clinica degli errori di processo o regole di arresto operativo.
- **Struttura dati (Campi JSON)**:
  - `titolo`: string (Titolo principale dell'avviso o della clinica dell'errore)
  - `avviso`: string opzionale (Messaggio centrale di cautela per layout compatto o di sezione)
  - `dettagli`: string opzionale (Spiegazione operativa della misura preventiva)
  - `lead`: string opzionale (Frase guida introduttiva della clinica degli errori o dell'avviso)
  - `punti`: array di stringhe opzionale (Elenco strutturato di limiti tecnici, trappole metodologiche o modalità di fallimento)
  - `callout`: string opzionale (Regola aurea o procedura di arresto operativo posta in evidenza speciale)
  - `badge`: string opzionale
  - `layout`: string opzionale (`"sezione"` per abilitare la resa monumentale hero con linea orizzontale priva di numero di sezione, titolo esteso e scheda dettagli ad alto contrasto)
- **Disposizione e Layout**:
  - *Layout Standard*: Box di avviso visivo con icona di avvertimento, intestazione dedicata e bordo sinistro con accento cromatico ambrato/arancione di sicurezza.
  - *Layout Strutturato (Clinica degli errori / Punti + Callout)*: Paragrafo introduttivo (`lead`), griglia o elenco a schede con badge numerato per ciascun punto (`punti`), e banner hero inferiore ad alto contrasto con pulsazione luminosa per la regola d'arresto (`callout`).
  - *Layout Sezione*: Composizione monumentale a tutta larghezza con testata hero e divider line ambrata.
- **Effetti visivi**: Icona di avviso con leggera animazione a respiro (*breathing pulse*), animazione a bagliore ciclico (*pulseGlow*) per il callout e bordo ambrato con micro-elevazione all'hover per le card dei punti.

---

## 16. CITAZIONE
- **Finalita didattica**: Commento di un estratto significativo tratto da una fonte autorevole, da un testo normativo o da uno studioso di riferimento.
- **Struttura dati (Campi JSON)**:
  - `titolo`: string
  - `citazione`: string (Testo del passaggio citato)
  - `autore`: string (Nome dell'autore, ente o pubblicazione)
  - `commento`: string opzionale (Nota di raccordo del formatore con la lezione)
  - `badge`: string opzionale
- **Disposizione e Layout**: Blocco citazione elegante con virgoletta grafica ingrandita, testo corsivo ad alta leggibilita, riga per l'autore e riquadro inferiore di commento metodologico.
- **Effetti visivi**: Comparsa morbida del testo e sottolineatura animata dell'autore.

---

## 17. CONCLUSIONI
- **Finalita didattica**: Chiusura del modulo formativo, ringraziamenti, sintesi dei risultati raggiunti e indicazioni per la sessione successiva.
- **Struttura dati (Campi JSON)**:
  - `titolo`: string
  - `messaggio`: string (Sintesi conclusiva o saluto finale)
  - `prossimoPasso`: string opzionale (Anticipazione del modulo successivo)
  - `badge`: string opzionale
- **Disposizione e Layout**: Layout a impatto pieno con grande icona di completamento e messaggio di congedo; il rientro alla dashboard e gestito tramite il comando dedicato sulla barra laterale.
- **Effetti visivi**: Animazione di celebrazione con icona di check che si disegna via SVG.