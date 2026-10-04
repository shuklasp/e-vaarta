/* MPL-2.0 */
import { createWorkspaceShell, navigateWorkspace, workspaceContract } from "../../modules/EvaartaWorkspaceShell.sys.mjs";
import { createIdentity, matchIdentities } from "../../modules/EvaartaIdentityGraph.sys.mjs";
add_task(function test_workspace_shell(){const shell=createWorkspaceShell();Assert.equal(shell.route,"inbox");Assert.equal(navigateWorkspace(shell,"project").route,"project");Assert.ok(workspaceContract().offlineFirst);});
add_task(function test_identity(){const a=createIdentity({id:"a",personId:"p",type:"email",value:"A@x.test"});const b=createIdentity({id:"b",personId:"q",type:"email",value:"a@x.test"});Assert.equal(matchIdentities(a,b),"exact");});
