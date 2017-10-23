import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Subject } from 'rxjs/Subject';

import * as ADD_COMMENT from '../graphql/AddComment.graphql';
import * as DELETE_COMMENT from '../graphql/DeleteComment.graphql';
import * as EDIT_COMMENT from '../graphql/EditComment.graphql';

const AddComment = (prev: any, { mutationResult: { data: { addComment } } }: any) => {
  if (prev.post) {
    // ignore if duplicate
    if (addComment.id !== null && prev.post.comments.some((comment: any) => addComment.id === comment.id)) {
      return prev;
    }

    return {
      post: {
        ...prev.post,
        comments: [...prev.post.comments, addComment]
      }
    };
  }
};

const DeleteComment = (prev: any, { mutationResult: { data: { deleteComment: { id } } } }: any) => {
  if (prev.post) {
    const index = prev.post.comments.findIndex((x: any) => x.id === id);
    // ignore if not found
    if (index < 0) {
      return prev;
    }

    return {
      post: {
        ...prev.post,
        comments: prev.post.comments.filter((comment: any) => comment.id !== id)
      }
    };
  }
};

@Injectable()
export default class PostCommentsService {
  public startedEditing = new Subject<any>();

  constructor(private apollo: Apollo) {}

  public addComment(content: string, postId: number) {
    return this.apollo.mutate({
      mutation: ADD_COMMENT,
      variables: {
        input: { content, postId }
      },
      optimisticResponse: {
        addComment: {
          id: -1,
          content,
          __typename: 'Comment'
        }
      },
      updateQueries: {
        post: AddComment
      }
    });
  }

  public editComment(id: number, postId: number, content: string) {
    return this.apollo.mutate({
      mutation: EDIT_COMMENT,
      variables: {
        input: { id, postId, content }
      },
      optimisticResponse: {
        __typename: 'Mutation',
        editComment: {
          id,
          content,
          __typename: 'Comment'
        }
      }
    });
  }

  public deleteComment(id: number, postId: number) {
    return this.apollo.mutate({
      mutation: DELETE_COMMENT,
      variables: {
        input: { id, postId }
      },
      optimisticResponse: {
        __typename: 'Mutation',
        deleteComment: {
          id,
          __typename: 'Comment'
        }
      },
      updateQueries: {
        post: DeleteComment
      }
    });
  }
}
