export interface CultureVignette {
  speaker: string;
  role: string;
  language: string;
  localFirst: string;
  localSecond: string;
  first: string;
  second: string;
}

export interface Community {
  name: string;
  slug: string;
  region: string;
  focus: string;
  keywords: string;
  symbol: string;
  meta: string;
  vignette: CultureVignette;
}

export const communities: Community[] = [
  {
    "name": "Jeju",
    "region": "Jeju Island, South Korea",
    "focus": "Jejueo language and island heritage",
    "keywords": "jeju korea language island",
    "symbol": "◒",
    "meta": "Jeju Island · Language",
    "slug": "jeju",
    "vignette": {
      "speaker": "Min-seo",
      "role": "Community radio volunteer",
      "language": "Jejueo",
      "localFirst": "난 갱 근처에서 사름들이 후닥닥 주고받는 제주어 들으멍 컷주마는, 라디오 위해 이웃들 녹음허기 시작허난 나가 잊어분 말들이 얼마나 많은지 그때사 알아졌주.",
      "localSecond": "우리는 녹음헌 거 하나하나 동네영 무을 이름 뎌서 표시허여. 이제 지도 보민, 그냥 질만 보이는 게 아니라 섬이 나신디 대답허는 소리가 들려.",
      "first": "I grew up hearing Jejueo in quick exchanges near the harbor, but I did not realize how many expressions I had forgotten until we began recording our neighbors for the radio.",
      "second": "We mark every recording by neighborhood and village. When I look at the map now, I do not just see roads—I hear the island speaking back."
    }
  },
  {
    "name": "Ainu",
    "region": "Hokkaido and northern Japan",
    "focus": "Ainu language, stories, and living heritage",
    "keywords": "ainu hokkaido japan language stories",
    "symbol": "◌",
    "meta": "Hokkaido · Language & stories",
    "slug": "ainu",
    "vignette": {
      "speaker": "Emi",
      "role": "Language-circle volunteer",
      "language": "Ainu",
      "localFirst": "Sisam pakno an-ko, iteki wenno, moto shak orowa moto poro. Chironnup pakno an-yaikoshirama, ne ukoyekarpa itak sekor ku-ye rusuy shiri. Toydek an-kotan orun, tanto an-nukar utar. Hoski itak, resuke okay pon menoko utar orun, an-koitak, an-kes eaykap wen shiri.",
      "localSecond": "An-oman rusuy shiri easkay wa, sine itak an-nukar, chise orun an-e-arpa, paikara an-e wa an-e rusuy. Nea itak, sisam itak eashkay kus, chise or ta an-oka, aynu itak eaykap wen, sine punkine ta pakno an-e wa an-uwekari kane.",
      "first": "Every Thursday evening, I sit between our oldest learner and the youngest child in the room. We repeat one everyday greeting until nobody is afraid of getting the rhythm wrong.",
      "second": "Before we leave, I choose one word to carry home and use at breakfast. That is how the language becomes part of family life again—not all at once, but one ordinary morning at a time."
    }
  },
  {
    "name": "Nüshu",
    "region": "Jiangyong County, Hunan, China",
    "focus": "A women-associated writing tradition and its cultural context",
    "keywords": "nushu china hunan script women writing",
    "symbol": "文",
    "meta": "Hunan · Writing tradition",
    "slug": "nushu",
    "vignette": {
      "speaker": "Lian",
      "role": "Writing-workshop participant",
      "language": "Jiangyong Tuhua",
      "localFirst": "Hei nei yi hoi nga miau yi hong Nüshu, nga ge shou dou fadou, yinwei ge zi kan qilai hen jiaoruo. Nga penbien ge fu nüen bianxie bianxie, yimian gong nga jiang gushi, na yi ye zhi shu jian jian gandao mo na me sheng le.",
      "localSecond": "Nga qichu lai shi wei le xue xie zi, danshi liu xialai shi wei le na xie tan hua. Mei yi ye zhi shu, dou ba jinri de lianxi gong zhe ge chuantong li de qingyi he jiyi lian zai yiqi.",
      "first": "The first time I traced a full line of Nüshu, my hand shook because the characters looked so delicate. The women beside me told stories as we wrote, and the page slowly felt less distant.",
      "second": "I began coming for the handwriting, but I stayed for the conversations. Every page connects practice today with the friendships and memories carried through this tradition."
    }
  },
  {
    "name": "Quechua",
    "region": "The Andes, South America",
    "focus": "Quechuan languages and diverse Andean communities",
    "keywords": "quechua peru bolivia ecuador andes language",
    "symbol": "◆",
    "meta": "Andes · Language family",
    "slug": "quechua",
    "vignette": {
      "speaker": "Rosa",
      "role": "Market vendor and radio caller",
      "language": "Southern Quechua",
      "localFirst": "Qatupi, tutamanta imaymana valechisqanmanta runasimipi rimani: imayna tiempo kasqanmanta, papa chanisninmanta, yachaywasimanta, hinaspa pipas wasiman apachikuyta munasqanmanta. Kayqa p'unchawta qallarichinapaq simi.",
      "localSecond": "Huk simanapi hukkuti kikin llaqta radio wasiman waqyani, hinaspa familiaypa rimasqan huk rimayta willani. Wawasniy asikunku uyariwaspa, ichaqa qhepatañataq paykunata uyarini kaqllata nichkaqta.",
      "first": "At the market, I speak Quechua about everything that matters that morning: the weather, the price of potatoes, school, and who needs a ride home. It is the language of getting the day moving.",
      "second": "Once a week I call the local radio program and share an expression my family uses. My children laugh when they hear me, but later I hear them repeating it."
    }
  },
  {
    "name": "Amazigh",
    "region": "North Africa and the Amazigh diaspora",
    "focus": "Amazigh languages, arts, and living heritage",
    "keywords": "amazigh berber morocco algeria north africa language",
    "symbol": "ⵣ",
    "meta": "North Africa · Living heritage",
    "slug": "amazigh",
    "vignette": {
      "speaker": "Yasmine",
      "role": "Student interviewer",
      "language": "Standard Moroccan Amazigh",
      "localFirst": "ⴳ ⵜⵉⵏⵎⵍ ⵏⵜⵜⴰⵔⴰ ⵉⵙⵎⴰⵡⵏ ⵏ ⵉⵎⴽⴰⵏⵏ ⵉⵇⵕⴱⵏ ⵙ ⵜⵉⴼⵉⵏⴰⵖ، ⵙⵓⵍ ⵏⵇⴰⴱⴰⵍ ⵜⵏ ⴷ ⵉⵙⵎⴰⵡⵏ ⵍⵍⵉ ⵜⵜⵎⴳⴳⴰⵍⵏ ⵜⵡⵊⵊⴰ ⵏⵏⵖ. ⵢⴰⵜ ⵜⴳⵎⵎⵉ ⵜⵣⵎⵔ ⴰⴷ ⵜⵍⴷⵉ ⴰⵎⵢⴰⵡⴰⴹ ⴰⵣⵢⵔⴰⵔ ⵅⴼ ⵎⴰⵏⵉ ⵙⴰ ⵜⵜⵉⴷⴷⵓⵏ ⵢⴰⵜ ⵢⵉⵎⵣⴷⴰⵖⵏ ⴷ ⵎⴰⵏⵉ ⵍⵍⴰⵏ ⵜⵜⵅⴷⴰⵎⵏ.",
      "localSecond": "ⵜⴰⵡⵓⵔⵉ ⵏ ⴷⴰⵔ ⵍⵍⵉ ⵅⴼ ⵓⴼⵖ ⵓⴳⴳⴰⵔ ⴳ ⵜⵎⵜⴰⵡⵜ ⴷ ⴱⴰⴱⴰ ⵙⵉⵜⵜⴰ. ⴰⵇⵇⴰⵍⵖ ⵙ ⵢⴰⵜ ⵜⴳⵓⵔⵉ، ⴷ ⵢⴰⵜ ⵜⵓⴽⵜⵉ، ⴷ ⵢⴰⵜ ⵜⴳⵎⵎⵉ ⴰⴷ ⵏⵜⵏ ⵔⵏⵓⵖ ⵉ ⵜⵉⵏⵎⵍ ⵉⵜⵜⵉⵍⵉⵏ.",
      "first": "In class we write the names of nearby places in Tifinagh, then compare them with the names our families use. A single place can open a long conversation about where people walked and worked.",
      "second": "My favorite homework is interviewing my grandfather. I return with one word, one memory, and one place to add to the next lesson."
    }
  },
  {
    "name": "Māori",
    "region": "Aotearoa New Zealand",
    "focus": "Te reo Māori and mātauranga Māori",
    "keywords": "maori māori aotearoa new zealand te reo language",
    "symbol": "∞",
    "meta": "Aotearoa · Language & knowledge",
    "slug": "maori",
    "vignette": {
      "speaker": "Hana",
      "role": "Marae kitchen volunteer",
      "language": "te reo Māori",
      "localFirst": "I ako ahau i aku whakatakinga tuatahi i runga i te māia i roto i te kīhini o te marae, e toru ngā mahi e haere tahi ana, me ngā whāea e whakatika ana i aku kupu me te kore e tū mai i ā rātou mahi. Kāore te reo i wehe kē i ngā tāngata i tōku taha.",
      "localSecond": "Nāianei, ka pēnei tonu tāku pōhiri i ngā kaitūao rangatahi. Ka piri tonu ia kīwaha hōu ki tētahi tangata, ki tētahi wāhi, me tētahi mea whai hua e mahia ngātahitia ana e mātou.",
      "first": "I learned my first confident introductions in the marae kitchen, with three jobs happening at once and aunties correcting me without stopping their work. The language was never separate from the people around me.",
      "second": "Now I welcome younger volunteers the same way. Each new phrase is attached to a person, a place, and something useful we are doing together."
    }
  },
  {
    "name": "Sámi",
    "region": "Sápmi, across northern Europe",
    "focus": "Sámi languages, livelihoods, and contemporary culture",
    "keywords": "sami sámi sapmi norway sweden finland russia languages",
    "symbol": "◇",
    "meta": "Sápmi · Languages & land",
    "slug": "sami",
    "vignette": {
      "speaker": "Elle",
      "role": "Community language learner",
      "language": "Northern Sámi",
      "localFirst": "Vuolla davviguovlluid čuovggas min luohkkálanjas leat dievva bearrašat, mat eai buohkat hupmá seamma sámegiela. Mus liikojuvvo dat bottus go okta dovddus sátni jiešguđetláhkái jiena luohkás, ja buohkat nuvttat lagabui.",
      "localSecond": "Mun jotket oanehis ságastallamiid áhkkun ovddabealde ja buvttán daid ruoktot luohkkái. Su jietna šaddá oassin oahpahusas, ja mu luohkkávirolaččat veahkehit mu gullat daid bienaid maid mun ledjen jávkat ruovttus.",
      "first": "In the low northern light, our classroom fills with families who do not all speak the same Sámi language. I love the moment when one familiar word sounds different across the room and everyone leans closer.",
      "second": "I record short conversations with my grandmother and bring them back to class. Her voice becomes part of the lesson, and my classmates help me hear details I missed at home."
    }
  },
  {
    "name": "Diné",
    "region": "Diné Bikéyah, Southwestern United States",
    "focus": "Diné language and community knowledge",
    "keywords": "dine diné navajo southwest united states language oral history",
    "symbol": "✦",
    "meta": "Southwest US · Language",
    "slug": "dine",
    "vignette": {
      "speaker": "Leah",
      "role": "Parent and language learner",
      "language": "Diné Bizaad",
      "localFirst": "Naaltsoos Diné Bizaad bee ééhózinígíí naaltsoos bikáaʼgi dah sitą́, éí bąą chidí bee naanáhwiidzoh, naʼanish, dóó dinner biniyé nihíká anáʼoolwoł biiskánígóó bee náánáhwiiʼnééh. Áłchíní shibiniyé shichʼįʼ nádaałkid, éí baa nihił dabáhózhǫ́ dóó nihíił dabidlo.",
      "localSecond": "Ahééhóziní bikʼeh shá hodínóotʼééł biniiyé nináháshdlį́į́h nisin ńtʼééʼ. Kʼad éí béédahózin díí bizaad éí bee iiná t’áá altso ałhąądei nihinaanish áłahji nídahwiidoołʼnééł éí bąą néihoniilnah leh.",
      "first": "Our Diné Bizaad cards stay on the kitchen table, so practice happens while we plan rides, chores, and dinner. The children correct me sometimes, and that makes all of us laugh.",
      "second": "I used to wait for a perfect time to study. Now I understand that the language grows through the life we are already living together."
    }
  },
  {
    "name": "Mapuche",
    "region": "Southern Chile and Argentina",
    "focus": "Mapudungun and Mapuche cultural continuity",
    "keywords": "mapuche chile argentina mapudungun language",
    "symbol": "◐",
    "meta": "Wallmapu · Mapudungun",
    "slug": "mapuche",
    "vignette": {
      "speaker": "Camila",
      "role": "Community radio producer",
      "language": "Mapudungun",
      "localFirst": "Nepen taiñ radio wirarün mew ta kiñe mapudungun chalintun mew, kañewma trawün nütramkan puwelu. Pu che feypitui trokiñ dungu, ül, ka pu wülngiñ dungu ñi wecun waria mew, feymew ta dungu witrampramniekefi taiñ mongen ñi rupan antü.",
      "localSecond": "Kake trür mew wiñotukefiñ kiñe küme dungu, pichi pichi ñi feypial. Rakiduamkefiñ pu allkütufe ñi feypial ka inche mew, fey mew amulniekefi wüne dungun mew, feymew ta radio ñi ütrüftukun rume alütu mongen mew.",
      "first": "I open our radio program with a Mapudungun greeting before the calls begin. People share announcements, music, and news from neighboring towns, so the language arrives with everyday life.",
      "second": "Between segments I repeat one useful expression slowly. I imagine listeners saying it with me, then carrying it into the next conversation after the radio goes quiet."
    }
  },
  {
    "name": "Inuit",
    "region": "Arctic regions of Greenland, Canada, and Alaska",
    "focus": "Diverse Inuit languages and knowledge systems",
    "keywords": "inuit arctic greenland canada alaska languages knowledge",
    "symbol": "❄",
    "meta": "Arctic · Languages & knowledge",
    "slug": "inuit",
    "vignette": {
      "speaker": "Ana",
      "role": "Classroom assistant",
      "language": "Inuktitut",
      "localFirst": "ᓄᑖᕋᐃᑦ ᐊᒻᒪ ᐅᐊᖓ ᐅᖃᐅᓯᕐᒥᒃ ᑎᓴᒪᐃᑦ ᐊᑖᓂᐅᖃᑦᑕᖅᑐᒍᑦ ᑕᒫᓐᓇ ᑕᑯᔭᖃᑦᑕᖅᑕᖏᓐᓄᑦ—ᐊᓐᓄᕌᓄᑦ, ᓂᕿᓄᑦ, ᓴᓇᔾᔨᐅᑏᑦ, ᐊᒻᒪ ᐃᓕᓴᐃᔭᐅᔪᓐᓇᖅᑐᑦ ᐊᓪᓚᕕᒻᒥᒃ ᓄᓇᒥᓄᑦ. ᐆᑦᑑᑎᒋᔪᓐᓇᖅᑕᒍᑦ ᑕᐃᒪᙵᓇᔭᖅᐳᑦ ᑐᓴᐅᒪᖃᑦᑕᓕᖅᑐᑦ ᖃᓄᐃᓕᐅᖃᑦᑕᕐᒪᖔᑕ, ᐅᖃᐅᓯᖏᓐᓂᒃ ᑐᓐᖓᓇᖅᑐᓄᑦ ᐊᐱᖅᓱᖅᑕᖓᓄᑦ ᓯᕗᓕᖅᐸᑦ.",
      "localSecond": "ᐃᓚᒌᑦ ᐊᔾᔨᒌᙱᑦᑐᓂᑦ ᓄᓇᖏᓐᓂ ᐆᒥᖓ, ᑖᒃᑯᐊ ᐊᔾᔨᒌᙱᑦᑐᓂᒃ ᐅᖃᐅᓯᕐᒥᒃ ᐊᑐᖅᐸᓪᓕᐊᔪᒍᑦ. ᐃᓕᓴᐃᕕᒃ ᐱᖅᑯᓯᓕᐅᖅᑐᖅ ᑕᐃᒃᑯᓄᖓ ᐊᔾᔨᒌᙱᑦᑐᐃᑦ ᑐᓴᖅᑕᐅᔪᑦ, ᓇᓗᓇᐃᖅᓯᔭᐅᓪᓗᑎᒃ, ᐊᒻᒪ ᐱᒻᒪᕆᐅᖃᑕᐅᖃᑦᑕᖅᑐᑦ.",
      "first": "The children and I place language labels on the things they see every day—clothing, food, tools, and familiar places. Soon they begin pointing to the words before I ask.",
      "second": "Our families come from different regions, so we do not always use the same term. The classroom has become a place where those differences are heard, compared, and valued."
    }
  },
  {
    "name": "Yolŋu",
    "region": "North-east Arnhem Land, Australia",
    "focus": "Yolŋu languages, kinship, and living traditions",
    "keywords": "yolngu yolŋu arnhem land australia language kinship",
    "symbol": "◎",
    "meta": "Arnhem Land · Living knowledge",
    "slug": "yolngu",
    "vignette": {
      "speaker": "Marika",
      "role": "Classroom mentor",
      "language": "Djambarrpuyŋu",
      "localFirst": "Ŋayi ŋunhi dhu dharaŋan ŋuli djäma limurru bala waŋganybuy map-gu ŋayathama, gu bala djäma ŋunhi gulmaram nhäma bala djorra'-gurra. Yothu-yulŋu ŋuli marŋgithirri ŋäthili yäku bilin dhu djäma bala wanga, gurruṯu, ga djäma marŋgithirr ŋunhi rom dhu nhäma dhäruk warray ŋayi ŋunhiyi walala yuwalk dhäruk dhu nhäma buku-ḏirithirr bala rrambaŋi wäŋa-yuwalkthi.",
      "localSecond": "Bala limurru dhu djäma ŋayathama gu wana bili bala dhäwu-dhäwu marŋgithirri gäthaŋur ŋäthili dhäwu-mirriyu ga ŋändi-mokuy-gurru. Ŋäma-nhära bala Wäŋa-ŋur dhu djäma gulŋi'-gulŋi'-yun nhämirr map-gu bala ŋayi dhu nhäma yuwalk.",
      "first": "We begin with local maps, but the lesson never stays on the paper. The young people ask how a name connects to place, kinship, and the responsibilities they meet in daily life.",
      "second": "Then we go outside and continue the conversation with teachers and family. Listening on Country changes what the map can mean."
    }
  },
  {
    "name": "Hmong",
    "region": "Southeast Asia and global diaspora communities",
    "focus": "Hmong languages, textiles, and oral traditions",
    "keywords": "hmong southeast asia diaspora language textiles stories",
    "symbol": "✺",
    "meta": "Southeast Asia · Diaspora",
    "slug": "hmong",
    "vignette": {
      "speaker": "Mai",
      "role": "Textile artist and aunt",
      "language": "Hmong Daw",
      "localFirst": "Thaum peb tsev neeg hu duab cuag lus, kuv nqa ib daim ntaub tsho los ze rau lub koob yees duab thiab nug cov me nyuam saib lawv pom dab tsi. Ib qho qauv txawm los ua tus pib ntawm cov lus Hmoob, cov kev nco qab, thiab ntau yam lus nug.",
      "localSecond": "Kuv tus ntxhais ntawm kwv tij khaws txhua lo lus tshiab nyob ntawm ib daim duab. Txawm nyob deb ntau txoj kev los, ib yam khoom uas neeg tes ua tseem coj peb txoj kev sib tham nyob ze ib leeg.",
      "first": "During our family video calls, I hold a piece of textile close to the camera and ask the children what they notice. A pattern becomes the beginning of Hmong words, memories, and many questions.",
      "second": "My niece saves each new word beside a photograph. Even across many miles, something made by hand keeps our conversation close."
    }
  },
  {
    "name": "Haida",
    "region": "Haida Gwaii and southern Alaska",
    "focus": "Haida language, art, and community continuity",
    "keywords": "haida x̱aayda haida gwaii alaska language art",
    "symbol": "◍",
    "meta": "Haida Gwaii · Language & art",
    "slug": "haida",
    "vignette": {
      "speaker": "Sara",
      "role": "Language-workshop volunteer",
      "language": "X̱aad Kíl",
      "localFirst": "Gam st'ang gud kwaagiihlaay tluu, hl guu community hall gwaay gud gam hlgwaagang, sk'ad giidaay gyaahlaang gud sk'ad gud isda, ad ts'aahlii gyaaGang gud giina sk'ad hl kya'áang. Hl gud isdaang gyaan, hl st'ang xitiin gud sGuudang lla xitiin gud giinang gud kya'aang gud isdang.",
      "localSecond": "Giina gud kwaagang gud yahguudang lla, gyaa table gud isda k'yuwaas gud kya'aang lla stlaay giinang gud isdaang. Lla sk'ad gud isda, lla sk'ad gud kya'aang, ad lla sk'ad gud ts'aahlii giina gud giinang gud kya'aang giidaay lla xitiin gud isdaang gud t'alang.",
      "first": "Before our public workshop, we walk through the community hall naming everyday objects and practicing short exchanges. Repetition turns our nervousness into momentum.",
      "second": "When visitors arrive, every table becomes a small learning station. They hear a word, try it, and use it in a simple conversation before moving on."
    }
  },
  {
    "name": "Cherokee",
    "region": "Southeastern United States and Oklahoma",
    "focus": "Cherokee language, syllabary, and living communities",
    "keywords": "cherokee ᏣᎳᎩ southeast united states syllabary language",
    "symbol": "Ꮳ",
    "meta": "US Southeast · ᏣᎳᎩ",
    "slug": "cherokee",
    "vignette": {
      "speaker": "Anna",
      "role": "Syllabary student",
      "language": "Cherokee",
      "localFirst": "ᎢᎬᏱᏱ ᎠᏥᏃᎮᏛ ᏣᎳᎩ ᏗᎪᏪᎵᏍᎩ ᏓᏆᏬᏪᎳᏅᎢ ᎤᏍᏗ ᏦᎢᏳᎯ ᏄᏍᏛ ᎠᏉᎵᏍᏗ. ᎡᏙᏓ ᎤᏙᎯᏳᎢ ᎠᎩᏙᏓ ᎠᎦᏔ ᎩᎳᏉ ᎢᏳᏓᎵ ᎠᏥᏁᏤᎸᎩ, ᎠᎴ ᎤᏁᏤᎸᎢ ᏦᎢ ᎢᏳᏩᎫᏛ ᎦᏬᏂᏍᎬ ᏓᏆᎪᎵᏰᏒᎩ.",
      "localSecond": "Ꮎ ᎤᏍᏗ ᎨᏒ ᎪᏪᎵ ᎠᎴ ᏗᎦᏬᏂᏒ ᏗᎦᏘᏲᎯᏍᏗ ᏄᎵᏍᏔᏅᎩ ᏧᏓᏘᎾᎥᎢ ᎠᎾᎵᏃᎮᏗᏍᎬ ᎬᏙᏗ. ᎪᎯ ᎨᏒ ᏌᏉ ᎪᏪᎵ ᏥᏬᏪᎳᏗᏍᎪ ᏂᏚᎩᏨᏂᏒᎢ, ᎾᏍᎩᏂ ᎡᎳᏗ ᏗᎪᏪᎵᏍᎩ ᎤᏰᎸᎢ ᏓᎩᏲᎲᏍᎦ ᎠᏆᏂᏛᏗᏱ ᎨᏒᎢ.",
      "first": "The first message I sent in the Cherokee syllabary was only a short greeting. My aunt replied immediately, and I read her answer aloud three times.",
      "second": "That small exchange changed practice into a family conversation. Now I write one message each day, even when I have to look up half the characters."
    }
  },
  {
    "name": "Garifuna",
    "region": "Caribbean and Central American communities",
    "focus": "Garifuna language, music, and transnational heritage",
    "keywords": "garifuna caribbean belize honduras guatemala nicaragua language music",
    "symbol": "≈",
    "meta": "Caribbean · Language & music",
    "slug": "garifuna",
    "vignette": {
      "speaker": "Elena",
      "role": "Music teacher",
      "language": "Garifuna",
      "localFirst": "Móuntili lubaragiñe wagüchagua le lidan aban gunfuranda. Ariñawagúati dimurei Garífuna houn ábinahani, houn héredeha, ha lílana houn subudini le lubéi laganwoun aban ubóu, dan lidan lílana lasigirún hasandiragún horoun hafalusehani le mabuidubaña.",
      "localSecond": "Aban lubéi le ñein katei le nagía luagu hamá, subudi hamati lun aban dimurei le lárigiñein layanuhóun, larufudúniwa, ha lasigirún furendéi lidan agumuchaha luágu subulón. Dimurei le, lidan sun gunfuranda lubéi, mabuidubagüdün lidan aban afurendeirugu lumúti.",
      "first": "Our rehearsal room is never quiet. Garifuna words move between the songs, the jokes, and the neighborhood announcements while the younger musicians find their rhythm.",
      "second": "I want them to feel that a phrase can be spoken, sung, and carried into community life. The language belongs in the whole room, not only in a lesson."
    }
  },
  {
    "name": "Sápara",
    "region": "Amazonian Ecuador and Peru",
    "focus": "Sápara language and forest knowledge",
    "keywords": "sapara sápara ecuador peru amazon language forest",
    "symbol": "✧",
    "meta": "Amazonia · Language",
    "slug": "sapara",
    "vignette": {
      "speaker": "Lucía",
      "role": "Youth language learner",
      "language": "Sápara",
      "localFirst": "Sasii shitawa pashiiya washa, wayaana kirikiaka ñi kwatiakita nawe pankura, ñanura, ari ñawaawa shimikuna nawenuka. Chi pankura ñika yachachin maikaka chi shimi wayaana wayaawa kirikianuka.",
      "localSecond": "Apaya rimaikuna ñiwaya kwintan chi shimikunata, ñikaka wiñachin imaka ñi mana katinawa. Rimai sami ashwa achikya paakinuka, ñi yachaikashka maikapi ari maikan ora chi shimi wayaawa tiyawaka.",
      "first": "After our forest walk, I return to class with notes about the words connected to plants, paths, and weather. The page reminds me where each word entered the conversation.",
      "second": "Older speakers repeat the words with us, and I listen for what I missed. Pronunciation becomes easier when I can remember the place and moment around it."
    }
  },
  {
    "name": "Nenets",
    "region": "Russian Arctic and western Siberia",
    "focus": "Nenets language and diverse contemporary livelihoods",
    "keywords": "nenets russia arctic siberia language reindeer",
    "symbol": "△",
    "meta": "Russian Arctic · Language",
    "slug": "nenets",
    "vignette": {
      "speaker": "Nadya",
      "role": "Youth organizer",
      "language": "Tundra Nenets",
      "localFirst": "Мянʼ мырем маршрут картам ямбʼёркана намдалаваʼ, тэнзʼ ерв нюдей нюмдэй нентумбий тедаʼ тюку тохолкугаваʼ, школаʼ школьнэй расписаниенандʼ пынэй тесʼ путана мэта нэсындараваʼ. Тарем ялʼ хибяхарт ялʼ ӈопой мал падарт токалевахарт хантывы.",
      "localSecond": "Мань нюмдэй нʼадаʼ тедаʼ пландарнаваʼ ӈамгэ падар. Мянʼ ебонди, вадаʼ мянʼ ниня ханʼгарт ниʼ хая — тюку ӈопой я’ пыдтарана тедаʼ ӈамгэ илебцʼ пыда яля.",
      "first": "My family gathers around a route map and compares older place names with the notes we use for travel and school schedules today. Everyone remembers a different detail.",
      "second": "I write the names beside our modern plans. For me, the language does not sit behind us—it travels through the same landscape into the life we have now."
    }
  },
  {
    "name": "Basque",
    "region": "Euskal Herria, Spain and France",
    "focus": "Euskara and contemporary Basque culture",
    "keywords": "basque euskara spain france language europe",
    "symbol": "✣",
    "meta": "Euskal Herria · Euskara",
    "slug": "basque",
    "vignette": {
      "speaker": "Ane",
      "role": "Euskara café volunteer",
      "language": "Euskara",
      "localFirst": "Gure kafetegian, eskolako, laneko eta auzoko ekitaldiak euskaraz antolatzen ditugu. Inork ez du elkarrizketa geldiarazten ikasgai bat iragartzeko; hiztun berriak, prest daudenean, besterik gabe batzen dira.",
      "localSecond": "Nire esaldirik erabilgarrienak gelan zehar zebiltzala entzunda ikasi nituen. Orain, beste norbaitek elkarrizketan modu berean sar dadin tokia egiten dut.",
      "first": "At our café, we plan school, work, and neighborhood events in Euskara. Nobody stops the conversation to announce a lesson; new speakers simply join when they are ready.",
      "second": "I learned my most useful phrases by hearing them move around the room. Now I make space for someone else to enter the conversation the same way."
    }
  },
  {
    "name": "Maasai",
    "region": "Southern Kenya and northern Tanzania",
    "focus": "Maa language, pastoral lifeways, and contemporary community life",
    "keywords": "maasai maasai kenya tanzania maa language pastoral east africa",
    "symbol": "◈",
    "meta": "Kenya & Tanzania · Maa",
    "slug": "maasai",
    "vignette": {
      "speaker": "Naserian",
      "role": "Primary school teacher",
      "language": "Maa",
      "localFirst": "Enkitoip inono, kiyeu enkutuk oo lmaasai amu kake iyeu enkiteng entoki ang.",
      "localSecond": "Kata pooki, kikitoip ilchekut linono enkutuk pooki, amu kata sapuk enkishon ang.",
      "first": "Every morning I greet my students in Maa before we start lessons, because our language carries who we are.",
      "second": "Each week, we invite older speakers to share words with the children, keeping the language present in everyday school life."
    }
  },
  {
    "name": "Nubian",
    "region": "Southern Egypt and northern Sudan",
    "focus": "Nobiin and Kenzi-Dongolawi languages, Nile heritage, and living communities",
    "keywords": "nubian nubia egypt sudan nile nobiin kenzi dongolawi languages",
    "symbol": "◫",
    "meta": "Egypt & Sudan · Nile heritage",
    "slug": "nubian",
    "vignette": {
      "speaker": "Amani",
      "role": "Community radio host",
      "language": "Nobiin",
      "localFirst": "Anna assel, ay Nobiin toosin niiru fadig, mange ay adenon toosir.",
      "localSecond": "Toskoyya, ay adenon kaadiisin toosir Nobiin galla, mange arus tirakon assel.",
      "first": "On my morning show, I read Nubian sayings aloud because listeners love hearing the language spoken at home.",
      "second": "Every week, I invite neighbors to share river memories in Nobiin, keeping our voices present for younger generations."
    }
  },
  {
    "name": "Wodaabe",
    "region": "Niger and the central Sahel",
    "focus": "Fulfulde language, mobile pastoral heritage, and contemporary Wodaabe life",
    "keywords": "wodaabe bororo niger sahel fulfulde nomadic mobile pastoral",
    "symbol": "○",
    "meta": "Niger & Sahel · Fulfulde",
    "slug": "wodaabe",
    "vignette": {
      "speaker": "Ali",
      "role": "Herding-family cooperative member",
      "language": "Fulfulde",
      "localFirst": "Ndeen mi wonaa e daaba, mi wowlata Fulfulde e sukaaɓe am, fii nde ɓe anndira demngal amen.",
      "localSecond": "Kala yontere, min mari ɓe njangu maa nder wuro, fii yo ɓe humpito taariika Wodaabe.",
      "first": "While tending cattle, I speak Fulfulde with my children so they learn the words our family uses across the grazing routes.",
      "second": "At the market we trade crafts and stories, keeping our language active through simple daily conversation."
    }
  },
  {
    "name": "San",
    "region": "Botswana, Namibia, and South Africa",
    "focus": "Diverse San communities, languages, land knowledge, and contemporary life",
    "keywords": "san southern africa botswana namibia south africa khoe kxa tuu languages",
    "symbol": "⋯",
    "meta": "Southern Africa · Diverse languages",
    "slug": "san",
    "vignette": {
      "speaker": "Kxao",
      "role": "Craft workshop leader",
      "language": "Juǀ’hoansi",
      "localFirst": "ǃXūn tsēsi, mí ǁxaǁxa ǃXaisen kx'ao-ǁ'aesi n|ang ǂxani, ka mí ǁgan hâ tama tsî.",
      "localSecond": "Tsēsi hoaraga, sida ǁxaǁxa ǃnona ǃXaisen ǀo'an, ka sida ǁxaǁxa ǁaraǁara sida ǃoms hâ.",
      "first": "At our weekly craft gathering, I teach young weavers words for plants and tools, keeping language woven into daily practice.",
      "second": "We sing together in Juǀ’hoansi, and the children learn how words are connected to the land around us."
    }
  },
  {
    "name": "Himba",
    "region": "Northern Namibia and southern Angola",
    "focus": "OtjiHimba language, pastoral heritage, and changing community life",
    "keywords": "himba ovahimba namibia angola otjihimba pastoral",
    "symbol": "◇",
    "meta": "Namibia & Angola · OtjiHimba",
    "slug": "himba",
    "vignette": {
      "speaker": "Kavezuva",
      "role": "Craft cooperative member",
      "language": "OtjiHimba",
      "localFirst": "Ondji ku tunga ozohutu okuza kongwena, nu mbi hongorera ovanatje vandje okuhungira OtjiHimba pomeva.",
      "localSecond": "Eyuva arihe tu tjangere ovina mbi tji vi ri omuinyo wetu.",
      "first": "I braid cords with the women's cooperative most mornings, and my children practice OtjiHimba while we work.",
      "second": "Every pattern becomes a conversation, and teaching it to the young ones keeps our language active in my hands."
    }
  },
  {
    "name": "Hadza",
    "region": "Lake Eyasi region, northern Tanzania",
    "focus": "Hadzane language, land-based knowledge, and contemporary livelihoods",
    "keywords": "hadza hadzabe tanzania hadzane lake eyasi language land knowledge",
    "symbol": "⊙",
    "meta": "Tanzania · Hadzane",
    "slug": "hadza",
    "vignette": {
      "speaker": "Sizigo",
      "role": "Community radio volunteer",
      "language": "Hadzane",
      "localFirst": "Nee tsem//kae dutsa la radio la ts'ikwa, nee kwi hazabe //ake Hadzane.",
      "localSecond": "Nee kwi haqan//e la baka la kwaneko la khoe la ekwazi.",
      "first": "I read short news updates on community radio, choosing words in Hadzane so older speakers and children hear the language together.",
      "second": "Recording these broadcasts each week feels ordinary, but it gives our grandchildren another way to recognize the sound of home."
    }
  },
  {
    "name": "Tuareg",
    "region": "Sahara and Sahel across North and West Africa",
    "focus": "Tamasheq-related languages, Tifinagh literacy, and mobile heritage",
    "keywords": "tuareg imuhagh imajaghen sahara sahel tamasheq tifinagh",
    "symbol": "ⵣ",
    "meta": "Sahara & Sahel · Tamasheq",
    "slug": "tuareg",
    "vignette": {
      "speaker": "Ehiya",
      "role": "School language tutor",
      "language": "Tamasheq",
      "localFirst": "Aḍan-in a itaggu tamasheq i medden n eddu, dagh tesuffa n imazighen a t-nsegmi as gar-anagh.",
      "localSecond": "Ḍar tuggat en tenere, ittaggu-anagh tamasheq ad-nesu isalan-nnegh gar-anagh.",
      "first": "I tutor children after school, writing Tifinagh letters in the sand so they connect Tamasheq sounds and shapes.",
      "second": "In the quiet of the evening, practicing our language keeps family stories moving forward with the young ones."
    }
  },
  {
    "name": "Afar",
    "region": "Ethiopia, Eritrea, and Djibouti",
    "focus": "Afar language, pastoral and coastal knowledge, and regional community life",
    "keywords": "afar danakil ethiopia eritrea djibouti afar language pastoral coastal",
    "symbol": "△",
    "meta": "Horn of Africa · Afar",
    "slug": "afar",
    "vignette": {
      "speaker": "Ambado",
      "role": "Farming cooperative organizer",
      "language": "Afar",
      "localFirst": "Ani buqre marat luk qafár afih yaabisa, kaadu xayla marat qafár af ken barsiisam faxeeh.",
      "localSecond": "Ummaan ayróh, buqrek edde xiqe waqdi qafár afal xaagitnaah, tama af nagaynah tanim faxximeh.",
      "first": "I organize planting schedules with neighbors in Afar and teach younger farmers our words for soil and rain.",
      "second": "Every harvest meeting becomes a chance to keep our language rooted in daily work, not only in memory."
    }
  },
  {
    "name": "Batwa",
    "region": "Great Lakes region of Central Africa",
    "focus": "Diverse Batwa communities, oral heritage, livelihoods, and present-day rights",
    "keywords": "batwa twa great lakes burundi rwanda uganda drc oral heritage",
    "symbol": "◌",
    "meta": "Great Lakes · Living heritage",
    "slug": "batwa",
    "vignette": {
      "speaker": "Ndayishimiye",
      "role": "Pottery workshop teacher",
      "language": "Kirundi",
      "localFirst": "Nkigisha abana gukora ibibumbano nk'uko abakurambere babigenza, dukoresheje ibumba tubona ku muhora.",
      "localSecond": "Iyo dukoraniye ku murima w'ibumba, dusangira inkuru kandi abana bakunda kwiga ururimi rwacu bakabikora.",
      "first": "I teach children to shape pots using clay we gather by the river.",
      "second": "When we meet at the workshop, we share stories and the children enjoy practicing language while their hands are busy."
    }
  },
  {
    "name": "Oromo",
    "region": "Ethiopia and northern Kenya",
    "focus": "Afaan Oromo, oral arts, Gadaa knowledge, and contemporary community life",
    "keywords": "oromo ethiopia kenya afaan oromo gada oral arts",
    "symbol": "◉",
    "meta": "Ethiopia & Kenya · Afaan Oromo",
    "slug": "oromo",
    "vignette": {
      "speaker": "Caalaa",
      "role": "Community radio presenter",
      "language": "Afaan Oromo",
      "localFirst": "Ani sagantaa raadiyoo ganamaa kan qonnaa fi haala jireenya baadiyyaa dubbatu dhiyeessa, afaan koo Afaan Oromoon.",
      "localSecond": "Namoonni bilbilaan nutti bilbilanii yaada kennuu jaalatu, kunis afaan keenya jiraachaa akka jiraatu gargaara.",
      "first": "I host a morning radio program about farming and rural life, speaking entirely in Afaan Oromo.",
      "second": "Listeners call in to share their thoughts, and that keeps our language useful in everyday public conversation."
    }
  },
  {
    "name": "Atayal",
    "region": "Mountain regions of Taiwan",
    "focus": "Atayal language, weaving, place knowledge, and contemporary community life",
    "keywords": "atayal tayal taiwan indigenous language weaving mountains",
    "symbol": "╳",
    "meta": "Taiwan · Language & weaving",
    "slug": "atayal",
    "vignette": {
      "speaker": "Yumin",
      "role": "School weaving instructor",
      "language": "Atayal",
      "localFirst": "Yaqih ku smyus ke na Tayal squliq laxi biru laqi qsyaq maku niqan.",
      "localSecond": "Musa qmayah cinbrayan na kayal, mstukuy ku laqi qsyaq ke Tayal squliq maku wal.",
      "first": "I teach weaving after school, explaining each pattern's name in Atayal as we work.",
      "second": "The students repeat the words, and slowly the language becomes part of their hands and memory."
    }
  },
  {
    "name": "Bunun",
    "region": "Central and southern mountain regions of Taiwan",
    "focus": "Bunun language, music, mountain knowledge, and living communities",
    "keywords": "bunun taiwan indigenous language pasibutbut music mountains",
    "symbol": "◬",
    "meta": "Taiwan · Language & music",
    "slug": "bunun",
    "vignette": {
      "speaker": "Biung",
      "role": "Farming cooperative leader",
      "language": "Bunun",
      "localFirst": "Saikin mapatas tu qabas mas maluspingaz tu kaviaz, tastu Bunun bunun a hai mabaliv tu tastu qanivan.",
      "localSecond": "Namu mudan tu davus, sinsuma pinaskal a pintasa mas Bunun a pasibaliv.",
      "first": "I help lead our farming cooperative, and we plant millet together by the seasonal calendar.",
      "second": "During planting, older members teach the Bunun words for each crop, keeping knowledge growing with the fields."
    }
  },
  {
    "name": "Karen",
    "region": "Myanmar, Thailand, and global diaspora communities",
    "focus": "Diverse Karen languages, textiles, oral traditions, and diaspora life",
    "keywords": "karen kayin myanmar thailand sgaw pwo languages diaspora textiles",
    "symbol": "▱",
    "meta": "Myanmar & Thailand · Languages",
    "slug": "karen",
    "vignette": {
      "speaker": "Naw Paw Htoo",
      "role": "Primary school teacher",
      "language": "S'gaw Karen",
      "localFirst": "ဖဲကၠိအံၤန့ၣ် ယမၤလိသရဲၣ်တဖၣ် ကညီကျိာ်လၢပှၤဆံးဖိသၣ်တဖၣ်အဂီၢ်, ဒီးအဝဲသ့ၣ်သးခုလၢအကထၢန့ၢ်ကလုၢ်ကထါလၢဟံၣ်ပှၤသ့ၣ်တဖၣ်ဆူကၠိပူၤလီၤ.",
      "localSecond": "မုၢ်နံၤတနံၤအံၤ ပဆှၢထီၣ်တၢ်ဂီၤအဆၢတဖၣ်လၢပှၤဒိဂီၢ်ကလုၢ်ထၢဖှိၣ်လၢပှၤဂီၢ်မုၢ်အဂီၢ်, ဒီးအဝဲသ့ၣ်ခီၣ်ဆၢလၢကျိာ်ဟဲဆှၢအါထီၣ်လၢအလီၢ်ကလုၢ်လီၤ.",
      "first": "I teach young children in S'gaw Karen, and they love bringing words home to share with their families.",
      "second": "Today we recorded songs for community radio, and the children were proud to hear their voices in our language."
    }
  },
  {
    "name": "Khasi",
    "region": "Meghalaya and adjoining areas of Northeast India",
    "focus": "Khasi language, oral literature, and matrilineal community life",
    "keywords": "khasi meghalaya india language oral literature matrilineal",
    "symbol": "◇",
    "meta": "Meghalaya · Language & oral literature",
    "slug": "khasi",
    "vignette": {
      "speaker": "Bakor",
      "role": "Community radio volunteer",
      "language": "Khasi",
      "localFirst": "Nga la khang ki jingpang ïa ka ktien Khasi sha ki khynnah shorbar kylleng, bad ki la kwah bha ban ïalade khlem jingïatynnad.",
      "localSecond": "Mynta nga la thoh ïa ki jingiaseng jong ki longkha na ka jingkren jong nga hapoh kani ka radio, bad ka bha ban shim ïa ka jingkylla jong ka ri.",
      "first": "I record simple Khasi language lessons for children in our village, and they enjoy repeating the words together.",
      "second": "Today I gathered neighbors' everyday expressions for community radio, preserving the sound of ordinary conversation."
    }
  },
  {
    "name": "Ifugao",
    "region": "Cordillera, northern Philippines",
    "focus": "Ifugao languages, rice-terrace knowledge, oral traditions, and community life",
    "keywords": "ifugao cordillera philippines tuwali ayangan rice terraces hudhud",
    "symbol": "▦",
    "meta": "Cordillera · Terrace knowledge",
    "slug": "ifugao",
    "vignette": {
      "speaker": "Bugan",
      "role": "Rice terrace farmer",
      "language": "Tuwali Ifugao",
      "localFirst": "Umat-tanom ak hi payo ke daan ay pinuunan da apu ku, ya ipahayag ku nan Tuwali Ifugao ke ammod ku ad uma.",
      "localSecond": "Hitu ay algo, in-map mi nan payo tako ke daan ay tulang ku, ya nabhagan-bagan mi nan hulun di Tuwali handi mi mun-hapit.",
      "first": "I plant rice on the terraces with my family, and we speak Tuwali Ifugao while we work.",
      "second": "Today my cousin and I mapped our fields, naming each terrace with the words we learned at home."
    }
  },
  {
    "name": "Iban",
    "region": "Borneo, especially Sarawak and West Kalimantan",
    "focus": "Iban language, riverine heritage, oral arts, and contemporary community life",
    "keywords": "iban dayak borneo sarawak kalimantan brunei iban language riverine",
    "symbol": "≋",
    "meta": "Borneo · Iban language",
    "slug": "iban",
    "vignette": {
      "speaker": "Ranee",
      "role": "Handicraft workshop leader",
      "language": "Iban",
      "localFirst": "Aku ngajar bala anak biak nganyam tikai enggau bahasa Iban lama, sida gaga amat ngena leka jaku ari apai indai sida.",
      "localSecond": "Kemari kami begempuru di rumah panjai lalu ngena leka jaku Iban lama madahka pengawa nganyam ke ari nembiak.",
      "first": "I teach young people to weave mats while speaking Iban, and they enjoy learning terms used by their parents.",
      "second": "Yesterday we gathered at the longhouse and described every step of weaving in our language."
    }
  },
  {
    "name": "Chukchi",
    "region": "Chukotka, Russian Far East",
    "focus": "Chukchi language, Arctic coastal and reindeer-herding knowledge, and contemporary life",
    "keywords": "chukchi chukotka russian far east chukchi language arctic reindeer coast",
    "symbol": "❅",
    "meta": "Chukotka · Arctic knowledge",
    "slug": "chukchi",
    "vignette": {
      "speaker": "Tumnene",
      "role": "Community radio volunteer",
      "language": "Chukchi",
      "localFirst": "Ынкъам ытлён рагтыркын нымным вэтгавэты, гымнан емнун валэ ынкы тумгытум.",
      "localSecond": "Гым тэйкыгъэ ярар ынкъам вальын нэнэнэт ынан лыгэйвыркынин чычеткин вагыргын.",
      "first": "Every evening I read children's stories in Chukchi over our village radio station.",
      "second": "I also practice songs with my grandson, so the language stays connected to time we spend together."
    }
  },
  {
    "name": "Evenki",
    "region": "Siberia, the Russian Far East, and Northeast China",
    "focus": "Evenki language, taiga knowledge, mobility, and contemporary heritage",
    "keywords": "evenki ewenki siberia northeast china reindeer taiga language",
    "symbol": "△",
    "meta": "Taiga regions · Evenki",
    "slug": "evenki",
    "vignette": {
      "speaker": "Bayan",
      "role": "School language teacher",
      "language": "Evenki",
      "localFirst": "Би сурукэн эвэды турэнмэ хэекэлдем нонап класс дюр.",
      "localSecond": "Минду хуклэ эмэнмуклэ эвэды туги гороты алагу.",
      "first": "I teach Evenki words to young students using pictures of reindeer and forest animals.",
      "second": "Later, families come to class to share the words and songs they use at home."
    }
  },
  {
    "name": "Kanak",
    "region": "Kanaky / New Caledonia",
    "focus": "Diverse Kanak languages, customary knowledge, arts, and contemporary life",
    "keywords": "kanak kanaky new caledonia melanesia languages customary knowledge",
    "symbol": "⟐",
    "meta": "Kanaky · Diverse languages",
    "slug": "kanak",
    "vignette": {
      "speaker": "Wanaan",
      "role": "Weaving workshop leader",
      "language": "Drehu",
      "localFirst": "Eni a inine la itre xeni thupene la xötrei nge sipu ini kowe la itre nekönatr.",
      "localSecond": "Ame la easa eköthe hi la itre trengen matre pane troa mele hnyawa la nöjei ewekë hne së hna tro fë.",
      "first": "I teach young women in our village to weave mats in the way I learned at home.",
      "second": "We gather each month so the patterns, words, and stories continue with the next generation."
    }
  },
  {
    "name": "CHamoru",
    "region": "Guåhan and the Northern Mariana Islands",
    "focus": "CHamoru language, island knowledge, navigation, and contemporary heritage",
    "keywords": "chamoru chamorro guam guahan northern mariana islands language ocean",
    "symbol": "◒",
    "meta": "Mariana Islands · CHamoru",
    "slug": "chamoru",
    "vignette": {
      "speaker": "Rosario",
      "role": "Farmers market coordinator",
      "language": "CHamoru",
      "localFirst": "Kada damenggo, hu na'huyong yan ma'å'ñao lokkue' i Fino' CHamoru gi metgot na kottura-ku.",
      "localSecond": "Hu fa'nu'i i famagu'on kalan asagua i tinituhon-ta yan i tano'-ta gi kada mensahi.",
      "first": "Every Sunday, I sell fruit at the market and greet everyone in CHamoru with pride.",
      "second": "I show the children how language connects the food we grow with the land and with one another."
    }
  },
  {
    "name": "Rapa Nui",
    "region": "Rapa Nui / Easter Island",
    "focus": "Rapa Nui language, Polynesian heritage, and contemporary island life",
    "keywords": "rapa nui easter island chile rapa nui language polynesian",
    "symbol": "◐",
    "meta": "Rapa Nui · Language & island life",
    "slug": "rapa-nui",
    "vignette": {
      "speaker": "Marama",
      "role": "School garden teacher",
      "language": "Rapa Nui",
      "localFirst": "He haka'ara au i te reo Rapa Nui ki ta'ku poki i te ka'ari i te tāpere.",
      "localSecond": "He mea rivariva te fa'ahiti i te mau parau tupuna i mua i te tomite o te kaiga.",
      "first": "I teach my child Rapa Nui words while we sit together in the school garden.",
      "second": "It feels good to share family sayings when the village meets and plans for the coming season."
    }
  },
  {
    "name": "Kānaka Maoli",
    "region": "Hawaiʻi",
    "focus": "ʻŌlelo Hawaiʻi, ʻike Hawaiʻi, and living Native Hawaiian community knowledge",
    "keywords": "kanaka maoli native hawaiian hawaii olelo hawaii knowledge",
    "symbol": "≈",
    "meta": "Hawaiʻi · ʻŌlelo Hawaiʻi",
    "slug": "kanaka-maoli",
    "vignette": {
      "speaker": "Kaimana",
      "role": "Community garden volunteer",
      "language": "ʻŌlelo Hawaiʻi",
      "localFirst": "Hōʻike au i kaʻu keiki i nā inoa mea kanu ma ke kīhāpai i kēlā me kēia lā.",
      "localSecond": "He mea hauʻoli ke kamaʻilio ʻōlelo Hawaiʻi me nā hoa i ka lā hana kīhāpai.",
      "first": "I show my child the names of our plants in the garden every day.",
      "second": "It brings joy to speak ʻōlelo Hawaiʻi with friends during our community garden workday."
    }
  },
  {
    "name": "Noongar",
    "region": "Southwest Western Australia",
    "focus": "Noongar language, relationships to Country, and contemporary community life",
    "keywords": "noongar nyungar southwest western australia language country",
    "symbol": "◎",
    "meta": "Southwest Australia · Country",
    "slug": "noongar",
    "vignette": {
      "speaker": "Kaya",
      "role": "Radio volunteer",
      "language": "Noongar",
      "localFirst": "Ngany waangkiny Noongar boodjar-koorl kaartdijin nitja radio show.",
      "localSecond": "Ngany djinang koorlangka boordier-ak wangkiny Noongar wangkiny mila-mila.",
      "first": "I share Noongar words about Country on our local radio show each week.",
      "second": "I love hearing young people call in and try speaking Noongar with confidence."
    }
  },
  {
    "name": "Meriam",
    "region": "Eastern Torres Strait Islands, Australia",
    "focus": "Meriam Mir language, sea knowledge, island kinship, and contemporary life",
    "keywords": "meriam mer torres strait islands meriam mir sea language",
    "symbol": "≋",
    "meta": "Torres Strait · Meriam Mir",
    "slug": "meriam",
    "vignette": {
      "speaker": "Tomas",
      "role": "Fisher and language learner",
      "language": "Meriam Mir",
      "localFirst": "Ka mina Meriam Mir ged emi baba giz au wed sagul-ge.",
      "localSecond": "Ka wakenu au natam Meriam Mir wed ged gasamge komunti meta.",
      "first": "I teach my grandson Meriam Mir names for fish while we mend our nets.",
      "second": "It makes me proud when he uses those words at our community gathering."
    }
  },
  {
    "name": "Lakota",
    "region": "Northern Plains, United States",
    "focus": "Lakȟótiyapi, oral traditions, and contemporary Lakota community life",
    "keywords": "lakota sioux northern plains united states lakotiyapi language",
    "symbol": "✦",
    "meta": "Northern Plains · Lakȟótiyapi",
    "slug": "lakota",
    "vignette": {
      "speaker": "Wanbli",
      "role": "Elementary school classroom aide",
      "language": "Lakȟótiyapi",
      "localFirst": "Aŋpétu kiŋ lé, wówapi ognáka waŋ wašíču iyápi na Lakȟótiyapi ognáka waŋžíla wóglaka uŋ wačhíŋ.",
      "localSecond": "Wakȟáŋyeža kiŋ héna tókša Lakȟótiyapi iápi kte, na míye iyúha wašté.",
      "first": "Today I helped a small classroom read a bilingual storybook, moving between English and Lakȟótiyapi together.",
      "second": "The children hear the language as part of an ordinary school day, and that makes me happy."
    }
  },
  {
    "name": "Anishinaabe",
    "region": "Great Lakes region of Canada and the United States",
    "focus": "Anishinaabemowin, stories, land relationships, and contemporary community knowledge",
    "keywords": "anishinaabe ojibwe odawa potawatomi great lakes anishinaabemowin",
    "symbol": "◍",
    "meta": "Great Lakes · Anishinaabemowin",
    "slug": "anishinaabe",
    "vignette": {
      "speaker": "Nokomis",
      "role": "Community radio host",
      "language": "Anishinaabemowin",
      "localFirst": "Noongom gii-dazhindaan gaa-izhi-nanaandawi'iwewaad noozhishenyag wiigwaasi-makakoon ge-ozhitoowaad.",
      "localSecond": "Gagwe-anishinaabemomin miinawaa noondaagoziyaan, mii sa gaa-zaagi'aan.",
      "first": "This morning I talked on local radio about my grandchildren learning to make birchbark baskets together.",
      "second": "We try to speak Anishinaabemowin on air, and I love hearing our language shared that way."
    }
  },
  {
    "name": "Mi’kmaq",
    "region": "Mi’kma’ki, Atlantic Canada",
    "focus": "Mi’kmawi’simk, land and water knowledge, and living Mi’kmaq heritage",
    "keywords": "mikmaq mi'kmaq mi'kma'ki atlantic canada mikmawisink language",
    "symbol": "◇",
    "meta": "Mi’kma’ki · Mi’kmawi’simk",
    "slug": "mi-kmaq",
    "vignette": {
      "speaker": "Sapiel",
      "role": "Fisheries monitor",
      "language": "Mi’kmawi’simk",
      "localFirst": "Sa'n na wjit nujjinen tlisukwewey, elukwaqney tan tel-nutmasin samqwan aq nemitutaq katew.",
      "localSecond": "Msit kaqi na wejiaq telimin Mi'kmawi'simk ta'n teluisi eskimin katew.",
      "first": "This week I checked the eel traps with young people from the community, watching the tide and learning river signs.",
      "second": "I always tell them the Mi’kmawi’simk words for each fish we find."
    }
  },
  {
    "name": "K’iche’ Maya",
    "region": "Guatemalan highlands",
    "focus": "K’iche’ language, oral traditions, weaving, and contemporary community knowledge",
    "keywords": "kiche maya guatemala highlands maya language oral traditions",
    "symbol": "◆",
    "meta": "Guatemala · K’iche’ language",
    "slug": "k-iche-maya",
    "vignette": {
      "speaker": "Ixchel",
      "role": "Weaving workshop leader",
      "language": "K’iche’",
      "localFirst": "Kamik xinkoj nuchak' rech tzij pa taller rech b'aq'lik, xinya'o k'utb'al chike ri ak'alab' rech kekunaj wuj.",
      "localSecond": "Kinya' q'ij chi ri qatzij K'iche' katzalij pa qach'a'oj chwach ri saq'ilanem.",
      "first": "Today I led a weaving workshop, showing young learners how to read pattern and color in the thread.",
      "second": "I make sure K’iche’ words return in every lesson, keeping language present in our daily craft."
    }
  },
  {
    "name": "Nahua",
    "region": "Central Mexico and diaspora communities",
    "focus": "Diverse Nahuatl varieties, arts, agriculture, and contemporary Nahua life",
    "keywords": "nahua nahuatl mexico central mexico diaspora languages traditions",
    "symbol": "✣",
    "meta": "Mexico · Nahuatl varieties",
    "slug": "nahua",
    "vignette": {
      "speaker": "Xochitl",
      "role": "Primary school teacher",
      "language": "Central Huasteca Nahuatl",
      "localFirst": "Nimomachtia nahuatl ika nopilhuan ipan cada tonalli. Tikchihuaj tlacuilolli ika totlajtol para amo mopolos.",
      "localSecond": "Nikijtoua toaltepetl ma tlajtoua nahuatl ika miac xihuitl ok. Nopilhuan quimatih tlen quinamiqui inintlajtol.",
      "first": "I teach Nahuatl at our village school each day. We make small storybooks in our language so children can take them home.",
      "second": "My students are proud when they recognize words used by people in their own families."
    }
  },
  {
    "name": "Guna",
    "region": "Guna Yala, Panama, and communities in Colombia",
    "focus": "Dulegaya language, island and territorial knowledge, arts, and community governance",
    "keywords": "guna kuna dule panama colombia guna yala dulegaya language mola",
    "symbol": "◫",
    "meta": "Guna Yala · Dulegaya",
    "slug": "guna",
    "vignette": {
      "speaker": "Nelson",
      "role": "Fisher and radio host",
      "language": "Dulegaya",
      "localFirst": "Anmar ibgwen degi Dulegaya, sunna anmar Guna Yala igar. Anmar ibmar sunmakedi radio-gi, anmar dulegaya sunmagged.",
      "localSecond": "Anmar bela gwenagwad be sabgwana, anmar nabir sunmakedi dulegaya be sabgwana. An gudi be dulegaya igar be nued.",
      "first": "Every morning I fish near our islands, then speak in Dulegaya on local radio about the day's news.",
      "second": "It makes me happy when children call the program and answer in our language."
    }
  },
  {
    "name": "Wayuu",
    "region": "La Guajira, Colombia and Venezuela",
    "focus": "Wayuunaiki, weaving, water knowledge, and transborder Wayuu community life",
    "keywords": "wayuu la guajira colombia venezuela wayuunaiki weaving transborder",
    "symbol": "✺",
    "meta": "La Guajira · Wayuunaiki",
    "slug": "wayuu",
    "vignette": {
      "speaker": "Jouktai",
      "role": "Weaver and market vendor",
      "language": "Wayuunaiki",
      "localFirst": "Tayakana mma wayuunaiki sünain teküinjatü mochiraaya. Talatirüin tü wayuunaikikat nümüin taashi süpüla nnojorüle amaa.",
      "localSecond": "Tanüiki wayuu kepiakat süpüla ayatüin achikimaajiraa wayuunaiki. Talatüjeere tayakana anaajatü nutuma wane wayuu jieyuu.",
      "first": "I weave mochilas while chatting in Wayuunaiki with my aunt at the market. I teach my niece the words for colors and threads.",
      "second": "I feel proud when visitors ask about our words and the younger sellers answer them."
    }
  },
  {
    "name": "Yanomami",
    "region": "Amazonia in Brazil and Venezuela",
    "focus": "Yanomami languages, forest knowledge, health, and contemporary community life",
    "keywords": "yanomami amazon brazil venezuela yanomami languages forest knowledge",
    "symbol": "◌",
    "meta": "Amazonia · Forest knowledge",
    "slug": "yanomami",
    "vignette": {
      "speaker": "Rewe",
      "role": "Farmer and community mapmaker",
      "language": "Yanomam",
      "localFirst": "Ya kōamotima yanomam thëpë ha wamaki tëhë. Ya hutimou wãro pei parimipë ha totihipë ha yamakat.",
      "localSecond": "Ya kuoma yanomam thëpë koro tëhë wãro. Ya horema pei yamakat kua tëhë wãro pei ke ai.",
      "first": "I plant cassava with my family, and we talk in Yanomam while we work in the garden each morning.",
      "second": "I help draw maps using our village names. It matters that our children learn those words too."
    }
  }
];

export function getCommunity(slug: string) {
  return communities.find((community) => community.slug === slug);
}
