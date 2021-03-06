import React, { Component } from 'react'
import {
  message,
  Icon,
  List,
  Popconfirm,
  Tag,
  Skeleton,
  Typography
} from 'antd';
// import ProfilePic from './ProfilePic';
// import EditAccountInfo from './EditAccountInfo';
import moment from 'moment'
import { API } from "aws-amplify";
import './profile.css';

// const InputGroup = Input.Group;
// const TabPane = Tabs.TabPane;
const { Paragraph, Text } = Typography;

export class ProfileFeed extends Component {
  constructor(props){
    super(props);

    this.state ={
      componentLoading: true,
      posts: [],
    }
  }

  async componentDidMount(){
    // console.log(this.props.currentUser);
    this.getPosts();
  }

  async getPosts() {
    this.setState({
      posts: [],
      componentLoading: true
    });

    let apiName = 'posts';
    let path = '/posts/get-posts-user';
    let myInit = {
      body: {user: this.props.currentUser}
    };
    const posts = await API.post(apiName, path, myInit);
    posts.body.map((post) => (
      this.setState({
        posts: [
          ...this.state.posts,
          {
            subfeed: post.subfeed,
            timestamp: post.timestamp,
            id: post.id,
            user: post.user,
            title: post.title,
            content: post.content,
            likes: post.likes,
            dislikes: post.dislikes
          }
        ]
      })
    ));
    
    this.setState({componentLoading: false});
  }

  deletePost(id, timestamp){
    // console.log(`Deleting post with id: ${id}`)
    let apiName = 'posts';
    let path = '/posts/delete-post';
    let myInit = {
      body: {
        id: id,
        timestamp: timestamp
      }
    };
    API.del(apiName, path, myInit).then(response => {
      this.getPosts();
      message.success('Successfully deleted post!');
      // console.log('Success in deleting post:', response);
    }).catch(error => {
      message.error('Could not delete post.');
      console.log(error.response)
    });
  }

  render() {
    let data = this.state.posts;
    let loading = this.state.componentLoading;

    const CounterIcon = ({name, count}) => (
      <span>
        <Text>{name}: </Text>
        <Text style={{color: '#1890FF'}}>{count}</Text>
      </span>
    );

    const DeleteIcon = ({ createdBy, id, timestamp }) => (
      <span>
          <Popconfirm title="Are you sure delete this post?" onConfirm={() => this.deletePost(id, timestamp)} onCancel={() => {return null}} okText="Yes" cancelText="No">
            <Icon type="delete" style={{ right: 5}} />
          </Popconfirm>
      </span>
    );

    const blankData = [];
    for (let i = 0; i < 5; i++) {
      blankData.push({
        title: `Blank title`,
        description: 'Blank description',
        content: 'Blank content',
      });
    }

    return (
      <List
        itemLayout="vertical"
        size="large"
        pagination={{pageSize: 5}}
        dataSource={loading ? blankData : data}
        renderItem={item => (
          <List.Item
            key={item.title}
            actions={!loading && [ <CounterIcon name={"Likes"} count={item.likes.length}/>, <CounterIcon name={"Dislikes"} count={item.dislikes.length}/>, <Tag color="#1890FF">{item.subfeed}</Tag>, <DeleteIcon createdBy={item.user} id={item.id} timestamp={item.timestamp} />]}
          >
            <Skeleton loading={loading} active avatar>
              <List.Item.Meta
                title={item.title}
                description={moment(item.timestamp).format('MMMM Do YYYY, h:mm:ss a')}
              />
              <Paragraph ellipsis={{ rows: 4, expandable: true }}>
                {item.content}
              </Paragraph>
            </Skeleton>
          </List.Item>
        )}
      />
    )
  }
}

export default ProfileFeed
