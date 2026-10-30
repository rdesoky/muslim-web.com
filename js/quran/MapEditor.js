var MapEditor = {
  startPos: { line: 0, pos: 0 },

  syncPage: function (pageNo) {
    if (!pageNo) {
      return;
    }
    _E("EditSura").value = QData.pagesInfo[pageNo - 1].s;
    _E("EditAya").value = QData.pagesInfo[pageNo - 1].a;
    _E("EditEnd").checked = true;
    this.startPos = { line: 0, pos: 0 };
  },

  onClickPage: function (nPageNumber, x, y) {
    gPageMapVersion++;
    var nSide = QViewer.pageSide(nPageNumber);

    var anchor = _E("MapAnchor");

    var aya = parseInt(_E("EditAya").value, 10);
    var sura = parseInt(_E("EditSura").value, 10);
    var end = _E("EditEnd").checked;

    var line_number = PageMap.yPos2LineNum(y); //Math.floor( y / PageMap.lnHeight ) ;

    var position = 100 - Math.floor((x * 100) / PageMap.lnWidth);
    if (position < 4) {
      position = 0;
    }
    if (position > 94) {
      position = 100;
    }

    var currPos = {
      line: line_number,
      pos: position,
    };

    //alert( "Sura:" + sura + "; Aya:" + aya + "; End:" + end + "; Line:" + line_number + "; Pos:" + position + "%" );

    if (end) {
      //post information and advance aya
      var start_set_query =
        "t=0&pg=" +
        nPageNumber +
        "&s=" +
        sura +
        "&a=" +
        aya +
        "&l=" +
        this.startPos.line +
        "&x=" +
        this.startPos.pos;
      var end_set_query =
        "t=1&pg=" +
        nPageNumber +
        "&s=" +
        sura +
        "&a=" +
        aya +
        "&l=" +
        line_number +
        "&x=" +
        position;
      //alert(end_set_query);

      U.httpGet(
        "/cgi-bin/update_page_layout.pl?" + start_set_query,
        function (sHTML) {
          //alert(sHTML);
          document.title += "*";

          U.httpGet(
            "/cgi-bin/update_page_layout.pl?" + end_set_query,
            function (sHTML) {
              //alert(sHTML);
              //document.title += "*";
              PageMap.load(nPageNumber);
            }
          );
        }
      );

      if (aya >= QData.sura_info[sura - 1].ac) {
        _E("EditSura").value = sura + 1;
        _E("EditAya").value = 1;
        _E("EditEnd").checked = false;
      } else {
        _E("EditAya").value = aya + 1;
      }

      // set current postition as next start jump to next line start
      this.startPos.pos = position < 95 ? position : 0;
      this.startPos.line = position < 95 ? line_number : line_number + 1;
    } else {
      this.startPos = currPos;
      _E("EditEnd").checked = true;
      //this.startPos = currPos;
    }
  },

  mGetHTML: function () {
    return (
      "<div dir=ltr>" +
      "<div><span style='width:30px'>sura:</span><input type=text id='EditSura' /></div>" +
      "<div><span style='width:30px'>aya:</span><input type=text id='EditAya' /></div>" +
      "<div><span style='width:30px'>end?</span><input type=checkbox id='EditEnd' /></div>" +
      "<div id='EditorOutput' style='height:380px;overflow:auto;width:164px;padding:2px;background:white'></div>"
    );
    ("</div>");
  },
};

var test_data = [
  {
    sura: "1",
    aya: "1",
    sline: "0",
    spos: "30",
    eline: "0",
    epos: "80",
  },
  {
    sura: "1",
    aya: "1",
    sline: "1",
    spos: "10",
    eline: "3",
    epos: "60",
  },
  {
    sura: "1",
    aya: "2",
    sline: "3",
    spos: "60",
    eline: "6",
    epos: "20",
  },
  {
    sura: "1",
    aya: "3",
    sline: "6",
    spos: "20",
    eline: "6",
    epos: "100",
  },
  {
    sura: "1",
    aya: "4",
    sline: "7",
    spos: "0",
    eline: "12",
    epos: "15",
  },
  {
    sura: "1",
    aya: "5",
    sline: "12",
    spos: "15",
    eline: "14",
    epos: "75",
  },
];
