const reservedNames = [
  /^account$/,
  /^accounting$/,
  /^accounts$/,
  /^admin$/,
  /^alerts$/,
  /^amanda$/,
  /^amandahickman$/,
  /^app$/,
  /^billing$/,
  /^blog$/,
  /^bugs$/,
  /^chardot$/,
  /^chat$/,
  /^community$/,
  /^contact$/,
  /^cooldracula$/,
  /^daniel$/,
  /^danielcadenas$/,
  /^daphne$/,
  /^daphnemagnawa$/,
  /^design$/,
  /^developer$/,
  /^development$/,
  /^dorsey$/,
  /^email$/,
  /^engineer$/,
  /^evan henshaw$/,
  /^evan henshaw-plath$/,
  /^evan plath$/,
  /^evan$/,
  /^faq$/,
  /^finance$/,
  /^hello$/,
  /^help$/,
  /^hiring$/,
  /^hr$/,
  /^info$/,
  /^jack$/,
  /^jackdorsey$/,
  /^josh$/,
  /^joshbrown$/,
  /^joshbrownmoney$/,
  /^joshuatbrown$/,
  /^jtbrown$/,
  /^legal$/,
  /^linda $/,
  /^lindasetchell$/,
  /^liz$/,
  /^lizsweigart$/,
  /^marketing$/,
  /^martin$/,
  /^martindutra$/,
  /^matt$/,
  /^mattlorentz$/,
  /^mplorentz$/,
  /^notifications$/,
  /^operations$/,
  /^ops$/,
  /^payments$/,
  /^product$/,
  /^rabble$/,
  /^sebastian$/,
  /^sebastianheit$/,
  /^security$/,
  /^services$/,
  /^shaina$/,
  /^shainadane$/,
  /^shainathompson$/,
  /^snowden$/,
  /^spam$/,
  /^staff$/,
  /^support$/,
  /^tech$/,
  /^tools$/,
  /^web$/,
  /^zach$/,
  /^zachmandeville$/,
];

// this list is taken from https://docs.google.com/document/d/1zezyftfnze75uea7cr149ab5yo1ubgatrjh33-pb4zy/edit
const forbiddenNames = [
  /^cp$/,
  /^a2m$/,
  /^a55$/,
  /^ass$/,
  /^bum$/,
  /^cok$/,
  /^cox$/,
  /^cub$/,
  /^cum$/,
  /^die$/,
  /^fag$/,
  /^fuk$/,
  /^fux$/,
  /^gay$/,
  /^god$/,
  /^jap$/,
  /^jew$/,
  /^jiz$/,
  /^kum$/,
  /^kys$/,
  /^len$/,
  /^nob$/,
  /^omg$/,
  /^sex$/,
  /^tit$/,
  /^wtf$/,
  /xxx/,
  /5h1t/,
  /5hit/,
  /^anal$/,
  /anus/,
  /ar5e/,
  /arse/,
  /bomb/,
  /boob/,
  /^butt$/,
  /c0ck/,
  /cawk/,
  /cipa/,
  /cl1t/,
  /clit/,
  /cnut/,
  /cock/,
  /coon/,
  /cums/,
  /cunt/,
  /d1ck/,
  /damn/,
  /^dick$/,
  /^dink$/,
  /dlck/,
  /dyke/,
  /fags/,
  /fcuk/,
  /feck/,
  /fook/,
  /fuck/,
  /fuks/,
  /^hell$/,
  /hoar/,
  /hoer/,
  /^homo$/,
  /^hore$/,
  /isis/,
  /jerk/,
  /jism/,
  /jizm/,
  /jizz/,
  /kawk/,
  /^kill$/,
  /knob/,
  /kock/,
  /kums/,
  /kwif/,
  /lgbt/,
  /^lick$/,
  /lmao/,
  /loli/,
  /^lust$/,
  /m0f0/,
  /m0fo/,
  /^maga$/,
  /mof0/,
  /mofo/,
  /^muff$/,
  /nazi/,
  /p0rn/,
  /pawn/,
  /pedo/,
  /phuk/,
  /phuq/,
  /piss/,
  /poop/,
  /porn/,
  /pron/,
  /^pube$/,
  /rape/,
  /sh!+/,
  /sh!t/,
  /sh1t/,
  /shag/,
  /shi+/,
  /shit/,
  /slut/,
  /smut/,
  /^spac$/,
  /teez/,
  /thot/,
  /tits/,
  /titt/,
  /turd/,
  /tw4t/,
  /twat/,
  /wang/,
  /wank/,
  /a_s_s/,
  /adult/,
  /arrse/,
  /asses/,
  /b!tch/,
  /b00bs/,
  /b17ch/,
  /b1tch/,
  /bi+ch/,
  /bitch/,
  /boner/,
  /boobs/,
  /busty/,
  /chink/,
  /cliff/,
  /clits/,
  /cocks/,
  /coont/,
  /cunts/,
  /dildo/,
  /dinks/,
  /dirsa/,
  /doosh/,
  /duche/,
  /f4nny/,
  /faggs/,
  /fagot/,
  /fanny/,
  /fanyy/,
  /fucka/,
  /fucks/,
  /fuker/,
  /fux0r/,
  /heshe/,
  /hoare/,
  /horny/,
  /labia/,
  /lmfao/,
  /mutha/,
  /n1gga/,
  /negro/,
  /nigga/,
  /penis/,
  /phuck/,
  /phuks/,
  /porno/,
  /prick/,
  /pusse/,
  /pussi/,
  /pussy/,
  /queaf/,
  /queer/,
  /semen/,
  /shite/,
  /shits/,
  /shoot/,
  /skank/,
  /slope/,
  /sluts/,
  /spunk/,
  /teets/,
  /trump/,
  /twunt/,
  /v1gra/,
  /vulva/,
  /w00se/,
  /wanky/,
  /whoar/,
  /whore/,
  /willy/,
  /biatch/,
  /bimbos/,
  /bloody/,
  /bollok/,
  /bombed/,
  /booobs/,
  /bridge/,
  /buceta/,
  /bugger/,
  /cancer/,
  /choade/,
  /cummer/,
  /cyalis/,
  /dildos/,
  /doggin/,
  /erotic/,
  /facial/,
  /faggot/,
  /fagots/,
  /fatass/,
  /fcuker/,
  /fecker/,
  /flange/,
  /fooker/,
  /fucked/,
  /fucker/,
  /fuckin/,
  /fuckme/,
  /fukker/,
  /fukkin/,
  /fukwit/,
  /furfag/,
  /gaysex/,
  /goatse/,
  /hotsex/,
  /jewish/,
  /knobed/,
  /kondum/,
  /kummer/,
  /l3i+ch/,
  /l3itch/,
  /licker/,
  /mo.*fo/,
  /molest/,
  /muslim/,
  /muther/,
  /n1gger/,
  /nigg3r/,
  /nigg4h/,
  /niggah/,
  /niggas/,
  /niggaz/,
  /nigger/,
  /orgasm/,
  /pecker/,
  /phuked/,
  /pimpis/,
  /pissed/,
  /pisser/,
  /pisses/,
  /pissin/,
  /pornos/,
  /pricks/,
  /pussys/,
  /racist/,
  /rectum/,
  /retard/,
  /rimjaw/,
  /s.*hit/,
  /s.o.b./,
  /sadism/,
  /sadist/,
  /scroat/,
  /scrote/,
  /sexist/,
  /shited/,
  /shitey/,
  /shitty/,
  /smegma/,
  /snatch/,
  /sucker/,
  /tosser/,
  /twatty/,
  /v14gra/,
  /vagina/,
  /viagra/,
  /wanker/,
  /xrated/,
  /amateur/,
  /asshole/,
  /ballbag/,
  /bastard/,
  /bellend/,
  /bestial/,
  /bitched/,
  /bitcher/,
  /bitches/,
  /bitchin/,
  /blowjob/,
  /boiolas/,
  /bollock/,
  /bombing/,
  /boooobs/,
  /breasts/,
  /cumdump/,
  /cumming/,
  /cumshot/,
  /cuntbag/,
  /dogging/,
  /dumbass/,
  /f_u_c_k/,
  /fagging/,
  /faggitt/,
  /fcuking/,
  /fellate/,
  /fuckers/,
  /fucking/,
  /fucktoy/,
  /fuckwit/,
  /fukwhit/,
  /gaylord/,
  /goddamn/,
  /jackoff/,
  /knobead/,
  /knobend/,
  /kondums/,
  /kumming/,
  /lolicon/,
  /lusting/,
  /mafugly/,
  /muslims/,
  /niggers/,
  /nobhead/,
  /nutsack/,
  /orgasim/,
  /orgasms/,
  /phuking/,
  /phukked/,
  /pissers/,
  /pissing/,
  /pissoff/,
  /pussies/,
  /redtube/,
  /rimming/,
  /s_h_i_t/,
  /sandbar/,
  /schlong/,
  /scrotum/,
  /sexyhot/,
  /shagger/,
  /shaggin/,
  /shemale/,
  /shitass/,
  /shiting/,
  /shitted/,
  /shitter/,
  /t1tt1e5/,
  /t1tties/,
  /titfuck/,
  /tittie5/,
  /titties/,
  /titwank/,
  /twunter/,
  /willies/,
  /arsehole/,
  /assfukka/,
  /assholes/,
  /assmucus/,
  /assmunch/,
  /asswhole/,
  /ballsack/,
  /bangbros/,
  /bareback/,
  /beastial/,
  /birdlock/,
  /bitchers/,
  /bitching/,
  /blow.*me/,
  /blowjobs/,
  /blumpkin/,
  /booooobs/,
  /butthole/,
  /buttmuch/,
  /buttplug/,
  /buttrape/,
  /clitoris/,
  /cockface/,
  /cockhead/,
  /cocksuck/,
  /cocksuka/,
  /coksucka/,
  /cornhole/,
  /cuntlick/,
  /cyberfuc/,
  /dickhead/,
  /felching/,
  /fellatio/,
  /fistfuck/,
  /freaking/,
  /fuckface/,
  /fuckhead/,
  /fuckings/,
  /fuckmeat/,
  /fuckwhit/,
  /gangbang/,
  /god.*dam/,
  /horniest/,
  /knobhead/,
  /ma5terb8/,
  /masterb8/,
  /nobjocky/,
  /nobjokey/,
  /numbnuts/,
  /orgasims/,
  /phonesex/,
  /phukking/,
  /screwing/,
  /shagging/,
  /shitdick/,
  /shitfuck/,
  /shitfull/,
  /shithead/,
  /shitings/,
  /shitters/,
  /shitting/,
  /shooting/,
  /testical/,
  /testicle/,
  /twathead/,
  /anilingus/,
  /ass.*fuck/,
  /assfucker/,
  /bang.*box/,
  /blow.*job/,
  /blow.*mud/,
  /cockmunch/,
  /cocksucks/,
  /cocksukka/,
  /cuntsicle/,
  /cut.*rope/,
  /cyberfuck/,
  /dick.*shy/,
  /ejaculate/,
  /ejakulate/,
  /fistfucks/,
  /fuck.*ass/,
  /fuckheads/,
  /gangbangs/,
  /god.*damn/,
  /goddamned/,
  /ham.*flap/,
  /homophobe/,
  /jack.*off/,
  /jerk.*off/,
  /knob.*end/,
  /knobjocky/,
  /knobjokey/,
  /masochist/,
  /mongoloid/,
  /mothafuck/,
  /pedophile/,
  /pigfucker/,
  /pissflaps/,
  /predatory/,
  /shit.*ass/,
  /shittings/,
  /terrorism/,
  /terrorist/,
  /tit.*wank/,
  /tittyfuck/,
  /tittywank/,
  /autoerotic/,
  /bestiality/,
  /bitch.*tit/,
  /booooooobs/,
  /butt.*fuck/,
  /c0cksucker/,
  /cock.*snot/,
  /cocksucked/,
  /cocksucker/,
  /cokmuncher/,
  /cum.*freak/,
  /cunilingus/,
  /cunt.*hair/,
  /cuntlicker/,
  /depression/,
  /dick.*hole/,
  /ejaculated/,
  /ejaculates/,
  /f.*u.*c.*k/,
  /fannyflaps/,
  /far.*right/,
  /fingerfuck/,
  /fist.*fuck/,
  /fistfucked/,
  /fistfucker/,
  /fuck.*hole/,
  /fuck.*life/,
  /gang.*bang/,
  /gangbanged/,
  /gassy.*ass/,
  /homoerotic/,
  /homophobic/,
  /homosexual/,
  /kunilingus/,
  /m45terbate/,
  /ma5terbate/,
  /masterbat*/,
  /masterbat3/,
  /masterbate/,
  /masturbate/,
  /mothafucka/,
  /mothafucks/,
  /motherfuck/,
  /muff.*puff/,
  /nob.*jokey/,
  /pedophilia/,
  /ass.*fucker/,
  /beastiality/,
  /chota.*bags/,
  /clusterfuck/,
  /cockmuncher/,
  /cocksucking/,
  /corp.*whore/,
  /cunillingus/,
  /cunnilingus/,
  /cuntlicking/,
  /cut.*myself/,
  /cyberfucked/,
  /cyberfucker/,
  /dog.*fucker/,
  /doggiestyle/,
  /ejaculating/,
  /ejaculation/,
  /fannyfucker/,
  /fingerfucks/,
  /fistfuckers/,
  /fistfucking/,
  /fuck.*bitch/,
  /fudgepacker/,
  /god.*damned/,
  /hardcoresex/,
  /islamophobe/,
  /mothafuckas/,
  /mothafuckaz/,
  /mothafucked/,
  /mothafucker/,
  /mothafuckin/,
  /motherfucks/,
  /muthafecker/,
  /necrophilia/,
  /nut.*butter/,
  /penisfucker/,
  /pornography/,
  /pussy.*fart/,
  /blue.*waffle/,
  /clit.*licker/,
  /cock.*pocket/,
  /cock.*sucker/,
  /conservative/,
  /cum.*chugger/,
  /cum.*guzzler/,
  /cunt.*struck/,
  /cyberfuckers/,
  /cyberfucking/,
  /donkeyribber/,
  /eat.*a.*dick/,
  /ejaculatings/,
  /fingerfucked/,
  /fingerfucker/,
  /fistfuckings/,
  /fuck.*puppet/,
  /fuck.*trophy/,
  /kinky.*jesus/,
  /master.*bate/,
  /masterbation/,
  /mothafuckers/,
  /mothafucking/,
  /motherfucked/,
  /motherfucker/,
  /motherfuckin/,
  /motherfuckka/,
  /muthafuckker/,
  /mutherfucker/,
  /shit.*fucker/,
  /slut.*bucket/,
  /tittiefucker/,
  /anal.*impaler/,
  /anal.*leakage/,
  /anti.*semitic/,
  /beef.*curtain/,
  /bunny.*fucker/,
  /bust.*a.*load/,
  /carpetmuncher/,
  /cum.*dumpster/,
  /doggie.*style/,
  /fingerfuckers/,
  /fingerfucking/,
  /fudge.*packer/,
  /how.*to.*kill/,
  /masterbations/,
  /mothafuckings/,
  /motherfuckers/,
  /motherfucking/,
  /pussy.*palace/,
  /clitty.*litter/,
  /dirty.*sanchez/,
  /eat.*hair.*pie/,
  /flog.*the.*log/,
  /fuck.*yo.*mama/,
  /mother.*fucker/,
  /motherfuckings/,
  /sausage.*queen/,
  /carpet.*muncher/,
  /child.*predator/,
  /cop.*some.*wood/,
  /how.*to.*murdep/,
  /need.*the.*dick/,
  /f.*u.*c.*k.*e.*r/,
  /i.*want.*to.*die/,
  /son.*of.*a.*bitch/,
  /fuckingshitmotherfucker/,
  /make.*america.*great.*again/,
  ...reservedNames,
];

export default forbiddenNames;
