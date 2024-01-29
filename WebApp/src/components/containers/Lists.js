import { TabList as TabListV1 } from '@mui/lab';
import {
    Grid,
    Divider,
    Tab,
    ToggleButton,
    ToggleButtonGroup,
} from '@mui/material';
import {
    GridView as GridViewIcon,
    List as ListIcon,
} from '@mui/icons-material';
import List from '@mui/material/List';
import React, { useEffect, useState, useContext } from 'react';
import PropTypes from 'prop-types';
import DataBox from './DataBox';
import DocumentItem from '../items/DocumentItem';
import { DOCS_API, TASKS_API, PROJECTS_API } from '../../constants';
import { RoundedSearchField } from '../fields/SearchField';
import { AuthContext } from '../pages/auth/Auth';
import axios from 'axios';
import MemberItem from '../items/MemberItem';
import MemberDialog from '../dialogs/MemberDialog';
import DocumentDialog from '../dialogs/DocumentDialog';
import { TaskItem } from '../items/TaskItem';

export const TabList = (props) => {
    // props
    const { tabs, setTab } = props;

    const handleTabChange = (e, t) => {
        e.preventDefault();
        setTab(t);
    };

    return (
        <div>
            <TabListV1 onChange={handleTabChange} sx={{ ml: 3 }} {...props}>
                {tabs.map((tab) => (
                    <Tab key={tab.value} {...tab} />
                ))}
            </TabListV1>
            <Divider />
        </div>
    );
};

// prop validation
TabList.propTypes = {
    tabs: PropTypes.array,
    setTab: PropTypes.func,
};

export const DocumentList = (props) => {
    // props
    const { headerParams, dialog, setDialog } = props;

    // states
    const [docs, setDocs] = useState([]);
    const [view, setView] = useState('tiles');
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(dialog);

    //user info
    const { userInfo } = useContext(AuthContext);

    const handleViewChange = (e, newView) => {
        e.preventDefault();
        setView(newView);
    };

    const handleUpload = async (title, file, isOutline) => {
        if (selectedDoc) {
            // specify update
            const obj = {
                id: selectedDoc.id,
                title: title,
                outline: isOutline,
            };

            await axios.post(DOCS_API, JSON.stringify(obj), {
                params: { option: 'edit' },
            });
            await axios
                .get(DOCS_API, { params: headerParams })
                .then((res) => setDocs(res.data.records));
        } else {
            // convert file to base64
            const reader = new FileReader();
            reader.onload = async (e) => {
                const base64String = e.target.result.split('base64,')[1];
                const obj = {
                    title: title,
                    file: base64String,
                    filename: file.name,
                    project_id: '',
                    user_id: userInfo.userId,
                    outline: isOutline,
                };
                // if from project/documents page then add project_id
                if (headerParams.project_id) {
                    obj['project_id'] = headerParams.project_id;
                }

                await axios.post(DOCS_API, JSON.stringify(obj), {
                    params: { option: 'add' },
                });
                axios
                    .get(DOCS_API, { params: headerParams })
                    .then((res) => setDocs(res.data.records));
            };

            reader.readAsDataURL(file);
        }
    };

    const handleDelete = async (id) => {
        await axios.post(DOCS_API, JSON.stringify({ id: id }), {
            params: { option: 'delete' },
        });
        axios
            .get(DOCS_API, { params: headerParams })
            .then((res) => setDocs(res.data.records));
    };

    const handleDialogclose = () => {
        setDialogOpen(false);
        setDialog(false);
        setSelectedDoc(null);
    };

    const handleEdit = (doc) => {
        setDialog(true);
        setSelectedDoc(doc);
    };

    useEffect(() => {
        setDialogOpen(dialog);
    }, [dialog]);

    return (
        <DataBox
            data={docs}
            setData={setDocs}
            req={{ url: DOCS_API, headers: { params: headerParams }}}
        >
            <Grid container spacing={2} mb={3}>
                <Grid item sx={{ flexGrow: 1 }}>
                    <RoundedSearchField id="search-documents" sx={{ width: '100%' }} />
                </Grid>
                <Grid item>
                    <ToggleButtonGroup
                        value={view}
                        onChange={handleViewChange}
                        exclusive
                        aria-label="change content view"
                    >
                        <ToggleButton value="list">
                            <ListIcon />
                        </ToggleButton>
                        <ToggleButton value="tiles">
                            <GridViewIcon />
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Grid>
            </Grid>

            {docs && (
                <Grid container spacing={4}>
                    {docs.map((doc) => (
                        <DocumentItem
                            key={doc.id}
                            document={doc}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                        />
                    ))}
                </Grid>
            )}

            <DocumentDialog
                open={dialogOpen}
                onClose={handleDialogclose}
                onUpload={handleUpload}
                editDoc={selectedDoc}
            />
        </DataBox>
    );
};

DocumentList.propTypes = {
    headerParams: PropTypes.object,
    dialog: PropTypes.bool,
    setDialog: PropTypes.func,
};

export const MembersList = (props) => {
    // props
    const { dialog, setDialog, headerParams } = props;
    const { ownerId, id: projectId } = headerParams;

    //states
    const [members, setMembers] = useState([]);

    const handleAddMember = async (memberId) => {
        const obj = {
            id: projectId,
            user_id: memberId,
        };

        await axios.post(PROJECTS_API, JSON.stringify(obj), {
            params: { option: 'add_member' },
        });
        axios
            .get(PROJECTS_API, { params: { id: projectId, members: true }})
            .then((res) => setMembers(res.data.records));
    };

    const handleRemoveMember = async (memberId) => {
        const obj = {
            id: projectId,
            user_id: memberId,
        };

        await axios.post(PROJECTS_API, JSON.stringify(obj), {
            params: { option: 'remove_member' },
        });
        axios
            .get(PROJECTS_API, { params: { id: projectId, members: true }})
            .then((res) => setMembers(res.data.records));
    };

    const handleDialogclose = () => {
        setDialog(false);
    };

    return (
        <DataBox
            data={members}
            setData={setMembers}
            req={{ url: PROJECTS_API, headers: { params: headerParams }}}
        >
            <List dense sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {members &&
          members.map((member) => (
              <MemberItem
                  key={member.user_id}
                  data={member}
                  ownerId={ownerId}
                  onRemove={handleRemoveMember}
              ></MemberItem>
          ))}
            </List>
            <MemberDialog
                ownerId={ownerId}
                members={members}
                open={dialog}
                onAdd={handleAddMember}
                onRemove={handleRemoveMember}
                onClose={handleDialogclose}
            />
        </DataBox>
    );
};

MembersList.propTypes = {
    headerParams: PropTypes.object,
    dialog: PropTypes.bool,
    setDialog: PropTypes.func,
};

export const TaskList = (props) => {
    const { headerParams } = props;

    const [tasks, setTasks] = useState([]);

    return (
        <DataBox
            data={tasks}
            setData={setTasks}
            req={{ url: TASKS_API, headers: { params: headerParams }}}
        >
            <Grid container>
                {tasks.map((t) => (
                    <TaskItem key={t.id} projectId={headerParams.project_id} task={t} />
                ))}
            </Grid>
        </DataBox>
    );
};

TaskList.propTypes = {
    headerParams: PropTypes.object,
};
