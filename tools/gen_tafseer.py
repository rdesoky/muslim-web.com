import requests
import codecs
import pathlib

suraAyaCount = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111,
  110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45,
  83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55,
  78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20,
  56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21,
  11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6,
]

sources = [
  "KATHEER", "KORTOBY", "GALALEEN", "TABARY", 
  "en_yusufali" , "tr_ozturk", "fr_hamidullah", "de_bubenheim", "id_muntakhab", "ms_basmeih"
]

def main():
  for t in sources:
    for s in range(1, len(suraAyaCount) + 1):
      for a in range(1, suraAyaCount[s-1] + 1):
        if(t.find("_") == -1):
          url = f'http://dev.muslim-web.com/cgi-bin/gen_taf.pl?/tafseer/{t}/{s:03}{a:03}.html'
        else:
          url = f'http://dev.muslim-web.com/cgi-bin/get_db_taf.pl?src={t}&s={s}&a={a}'
        response = requests.get(url)
        text = response.text
        print( text )
        pathlib.Path(f'../../tafseer/{t}/{s:03}').mkdir(parents=True, exist_ok=True)
        with codecs.open(f'../../tafseer/{t}/{s:03}/{a:03}.html', 'w', "utf-8") as f:
          f.write(text)

if __name__ == '__main__':
    main()
