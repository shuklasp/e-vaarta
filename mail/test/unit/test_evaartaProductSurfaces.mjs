import {createWorkspaceSurface,reduceWorkspaceSurface} from "../../modules/EvaartaWorkspaceSurface.sys.mjs";
import {readerSelection} from "../../modules/EvaartaReaderSurface.sys.mjs";
import {createAnnotationFromSelection} from "../../modules/EvaartaAnnotationSurface.sys.mjs";
import {searchWorkspace} from "../../modules/EvaartaSearchSurface.sys.mjs";
add_task(async function test_surface_reducer(){const c={};const s=createWorkspaceSurface(c);Assert.equal(s.offline,true);const x=reduceWorkspaceSurface({}, {type:"selectDocument",id:"d1"});Assert.equal(x.selectedDocumentId,"d1");});
add_task(async function test_selection_annotation(){const a=createAnnotationFromSelection({documentId:"d1",selection:readerSelection("hello",0,5)});Assert.equal(a.text,"hello");Assert.equal(a.documentId,"d1");});
add_task(async function test_search(){const r=searchWorkspace({documents:[{id:"1",title:"Solar Plant"}]},"solar");Assert.equal(r.length,1);});
