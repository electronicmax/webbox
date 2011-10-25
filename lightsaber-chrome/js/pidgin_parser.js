
function pidgin_parse(s) {
    var subjects = {};
    var cur_subject;
    s.split('\n').map(
        function(cur_line) {
            var subj_relevant = false;
            var colon_idx = cur_line.indexOf(':');
            if (colon_idx >= 0 && (colon_idx == cur_line.length - 1 || (cur_line.indexOf('-') >= 0 && cur_line.indexOf('-') < cur_line.length - 1))) {
                cur_line = cur_line.trim(); 
                cur_subject = cur_line.substring(0, cur_line.indexOf(':'));
                subjects[cur_subject] = subjects[cur_subject] || {};
                cur_line = cur_line.substring(colon_idx+1);
                subj_relevant = true;
            }
            if (cur_line.length == 0) { return; }
            if (cur_subject && cur_line.indexOf('-') >= cur_line.search(/[^\W]/)+1) {
                console.log("line split ", cur_line.split(';'));
                cur_line.split(';').map(
                    function(cur_phrase) {
                        cur_phrase = cur_phrase.trim();
                        if (cur_phrase.indexOf('-') < 0) { return; }
                        var prop = cur_phrase.substring(0, cur_phrase.indexOf('-')).trim();
                        if (prop.length == 0) { console.log(" warning no prop -- phrase: \"", cur_phrase, "\""); return; }
                        var val = cur_phrase.substring(cur_phrase.indexOf('-') + 1);                                      
                        if (cur_subject === undefined) { console.log("WARNING subject undefined"); return; }
                        subjects[cur_subject][prop] = val;
                    });
                subj_relevant = true;
            }
            if (!subj_relevant) {
                console.log("clearing subject "); cur_subject = undefined;
            }
        });
    return subjects;
}